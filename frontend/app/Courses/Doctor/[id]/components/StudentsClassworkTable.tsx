"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/datatable";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/CustomPagination";
import { Button } from "@/components/ui/button";
import { DialogGradeStudent } from "./GradeStudent";

interface Student {
  stu_id: number;
  stu_name: string;
  stu_email: string;
  academic_year: string;
  grade?: string;
}

interface Quiz {
  quiz_id: number;
  quiz_title: string;
}

interface ClassworkGrade {
  stu_id: number;
  stu_name: string;
  stu_email: string;
  grades?: {
    midterm_grade?: number;
    classwork_grade?: number;
    quizes_grade?: number;
    final_grade?: string;
  };
}

type StudentWithGrades = Student & {
  grades: ClassworkGrade["grades"];
};

interface StudentsClassworkTableProps {
  students: Student[];
  classworkGrades: ClassworkGrade[];
  courseId: string;
  quizzes: Quiz[];
  onGradeUpdate: () => void;
}

const PAGE_SIZE = 8;

export function StudentsClassworkTable({
  students,
  classworkGrades,
  courseId,
  quizzes,
  onGradeUpdate,
}: StudentsClassworkTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const data = useMemo<StudentWithGrades[]>(() => {
    const gradesByStudent = new Map(
      classworkGrades.map((student) => [student.stu_id, student])
    );
    const registeredIds = new Set(students.map((student) => student.stu_id));

    const registeredStudents = students.map((student) => ({
      ...student,
      grades: gradesByStudent.get(student.stu_id)?.grades,
    }));

    const unlistedStudents = classworkGrades
      .filter((student) => !registeredIds.has(student.stu_id))
      .map((student) => ({
        stu_id: student.stu_id,
        stu_name: student.stu_name,
        stu_email: student.stu_email,
        academic_year: "",
        grades: student.grades,
      }));

    return [...registeredStudents, ...unlistedStudents];
  }, [students, classworkGrades]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((student) =>
      [student.stu_name, student.stu_email, student.academic_year]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const paginatedData = useMemo(
    () => filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, filteredData]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, students, classworkGrades]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filteredData.length]);

  const handleGradeStudent = (student: Student) => {
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = () => {
    onGradeUpdate();
    setGradeDialogOpen(false);
    setSelectedStudent(null);
  };

  const columns: ColumnDef<StudentWithGrades>[] = [
    {
      id: "stu_name",
      header: "Student Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.stu_name}</div>
      ),
    },
    {
      id: "stu_email",
      header: "Email",
      cell: ({ row }) => <div className="text-gray-600">{row.original.stu_email}</div>,
    },
    {
      id: "midterm_grade",
      header: "Midterm",
      cell: ({ row }) => (
        <div className="text-center">{row.original.grades?.midterm_grade ?? "-"}</div>
      ),
    },
    {
      id: "classwork_grade",
      header: "Classwork",
      cell: ({ row }) => (
        <div className="text-center">{row.original.grades?.classwork_grade ?? "-"}</div>
      ),
    },
    {
      id: "quizes_grade",
      header: "Quizzes",
      cell: ({ row }) => (
        <div className="text-center">{row.original.grades?.quizes_grade ?? "-"}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => handleGradeStudent(row.original)}
          variant="outline"
          size="sm"
        >
          Grade
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
        />
      </div>

      {data.length > 0 ? (
        <>
          <DataTable columns={columns} data={paginatedData} />
          <CustomPagination
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="py-4 text-center text-gray-600">No registered students for this course</p>
      )}

      {selectedStudent && (
        <DialogGradeStudent
          courseId={parseInt(courseId, 10)}
          student={selectedStudent}
          quizzes={quizzes}
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          onSubmit={handleGradeSubmit}
        />
      )}
    </div>
  );
}
