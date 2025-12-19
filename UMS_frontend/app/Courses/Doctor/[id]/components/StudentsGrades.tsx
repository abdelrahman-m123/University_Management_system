"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";

interface StudentGrade {
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
  quiz_grade: string;
  stu_id: number;
  stu_email: string;
  stu_name: string;
}

interface StudentGradesTableProps {
  grades: StudentGrade[];
}

export function StudentGradesTable({ grades }: StudentGradesTableProps) {
  const [data, setData] = useState<StudentGrade[]>(grades);

  useEffect(() => {
    setData(grades);
  }, [grades]);

  const columns = [
    {
      id: "stu_name",
      header: "Student Name",
      cell: ({ row }) => <div>{row.original.stu_name}</div>,
    },
    {
      id: "stu_email",
      header: "Email",
      cell: ({ row }) => <div>{row.original.stu_email}</div>,
    },
    {
      id: "quiz_title",
      header: "Quiz",
      cell: ({ row }) => <div>{row.original.quiz_title}</div>,
    },
    {
      id: "quiz_grade",
      header: "Grade",
      cell: ({ row }) => (
        <div>
          {row.original.quiz_grade || "Not Graded"}
        </div>
      ),
    },
    {
      id: "quiz_link",
      header: "Quiz Link",
      cell: ({ row }) => (
        <a 
          href={row.original.google_form_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Quiz
        </a>
      ),
    },
  ];

  return (
    <div>
      {data.length > 0 ? (
        <DataTable columns={columns} data={data} />
      ) : (
        <p className="text-gray-600 text-center py-4">No grades available for this course</p>
      )}
    </div>
  );
}