"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/datatable";
import { CustomPagination } from "@/components/CustomPagination";
import { Input } from "@/components/ui/input";
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

interface StudentsTableProps {
  students: Student[];
  courseId: string;
  quizzes: Quiz[];
  onGradeUpdate: () => void;
}

export function StudentsTable({ students,courseId, quizzes, onGradeUpdate }: StudentsTableProps) {
  const [data, setData] = useState<Student[]>(students);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const pageSize = 8;

  useEffect(() => {
    setData(students);
  }, [students]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((student) =>
      [student.stu_name, student.stu_email, student.academic_year]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize,
  );

  const handleGradeStudent = (student: Student) => {
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = () => {
    onGradeUpdate();
    setGradeDialogOpen(false);
    setSelectedStudent(null);
  };

  const columns: ColumnDef<Student>[] = [
    {
      id: "stu_name",
      header: "Name",
      cell: ({ row }) => <div>{row.original.stu_name}</div>,
    },
    {
      id: "stu_email",
      header: "Email",
      cell: ({ row }) => <div>{row.original.stu_email}</div>,
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
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Input
          className="w-full sm:max-w-sm"
          value={searchQuery}
          onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
          placeholder="Search students..."
          aria-label="Search students"
        />
      </div>

      <DataTable columns={columns} data={paginatedData} />
      <CustomPagination
        currentPage={visiblePage}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
      />
      
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
