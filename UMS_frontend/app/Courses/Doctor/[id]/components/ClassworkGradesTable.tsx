"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";

interface ClassworkGrade {
  stu_id: number;
  stu_name: string;
  stu_email: string;
  grades: {
    midterm_grade?: number;
    classwork_grade?: number;
    quizes_grade?: number;
    final_grade?: string;
  };
}

interface ClassworkGradesTableProps {
  classworkGrades: ClassworkGrade[];
  courseId: string;
}

export function ClassworkGradesTable({ classworkGrades, courseId }: ClassworkGradesTableProps) {
  const [data, setData] = useState<ClassworkGrade[]>(classworkGrades);

  useEffect(() => {
    setData(classworkGrades);
  }, [classworkGrades]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-green-600 font-semibold";
      case "B": return "text-blue-600 font-semibold";
      case "C": return "text-yellow-600 font-semibold";
      case "D": return "text-orange-600 font-semibold";
      case "F": return "text-red-600 font-semibold";
      default: return "text-gray-900";
    }
  };

  const columns = [
    {
      id: "stu_name",
      header: "Student Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.stu_name}
        </div>
      ),
    },
    {
      id: "stu_email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-gray-600">
          {row.original.stu_email}
        </div>
      ),
    },
    {
      id: "midterm_grade",
      header: "Midterm",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.grades.midterm_grade || "-"}
        </div>
      ),
    },
    {
      id: "classwork_grade",
      header: "Classwork",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.grades.classwork_grade || "-"}
        </div>
      ),
    },
    {
      id: "quizes_grade",
      header: "Quizzes",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.grades.quizes_grade || "-"}
        </div>
      ),
    }
  ];

  return (
    <div>
      <DataTable 
        columns={columns} 
        data={data}
      />
    </div>
  );
}