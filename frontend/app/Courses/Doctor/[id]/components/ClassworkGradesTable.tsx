"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/datatable";
import { CustomPagination } from "@/components/CustomPagination";
import { Input } from "@/components/ui/input";

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

interface ClassworkGradesTableProps {
  classworkGrades: ClassworkGrade[];
  courseId: string;
}

export function ClassworkGradesTable({ classworkGrades, courseId }: ClassworkGradesTableProps) {
  const [data, setData] = useState<ClassworkGrade[]>(classworkGrades);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setData(classworkGrades);
  }, [classworkGrades]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((student) =>
      [student.stu_name, student.stu_email]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize,
  );

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-green-600 font-semibold";
      case "B": return "text-blue-900 font-semibold";
      case "C": return "text-yellow-600 font-semibold";
      case "D": return "text-orange-600 font-semibold";
      case "F": return "text-red-600 font-semibold";
      default: return "text-gray-900";
    }
  };

  const columns: ColumnDef<ClassworkGrade>[] = [
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
          {row.original.grades?.midterm_grade ?? "-"}
        </div>
      ),
    },
    {
      id: "classwork_grade",
      header: "Classwork",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.grades?.classwork_grade ?? "-"}
        </div>
      ),
    },
    {
      id: "quizes_grade",
      header: "Quizzes",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.grades?.quizes_grade ?? "-"}
        </div>
      ),
    }
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

      <DataTable 
        columns={columns} 
        data={paginatedData}
      />
      <CustomPagination
        currentPage={visiblePage}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
