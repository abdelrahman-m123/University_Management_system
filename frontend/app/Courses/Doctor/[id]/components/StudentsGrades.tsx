"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/datatable";
import { Input } from "@/components/ui/input";
import { CustomPagination } from "@/components/CustomPagination";

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
  courseId: string;
}

export function StudentGradesTable({ grades, courseId }: StudentGradesTableProps) {
  const [data, setData] = useState<StudentGrade[]>(grades);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;

  useEffect(() => {
    setData(grades);
  }, [grades]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((grade) =>
      [grade.stu_name, grade.stu_email, grade.quiz_title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const paginatedData = useMemo(
    () => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, grades]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filteredData.length]);

  const columns: ColumnDef<StudentGrade>[] = [
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
          className="text-blue-900 hover:underline"
        >
          View Quiz
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search quiz grades..."
          aria-label="Search quiz grades"
        />
      </div>

      {data.length > 0 ? (
        <>
          {filteredData.length > 0 ? (
            <DataTable columns={columns} data={paginatedData} />
          ) : (
            <p className="py-4 text-center text-gray-600">
              No quiz grades match your search
            </p>
          )}
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-gray-600 text-center py-4">No grades available for this course</p>
      )}
    </div>
  );
}
