"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
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
  quizzes: Quiz[];
  onGradeUpdate: () => void;
}

export function StudentsTable({ students, quizzes, onGradeUpdate }: StudentsTableProps) {
  const [data, setData] = useState<Student[]>(students);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  useEffect(() => {
    setData(students);
  }, [students]);

  const handleGradeStudent = (student: Student) => {
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  const handleGradeSubmit = () => {
    onGradeUpdate();
    setGradeDialogOpen(false);
    setSelectedStudent(null);
  };

  const columns = [
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
    <div>
      <DataTable columns={columns} data={data} />
      
      {selectedStudent && (
        <DialogGradeStudent
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