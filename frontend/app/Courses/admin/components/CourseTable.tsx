"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateCourse } from "./CreateCourse";
import Sidebar from "@/components/sidebar";
import { getAllCourses, removeCourse } from "../actions";
import { CustomPagination } from "@/components/CustomPagination";
import { PageHeader } from "@/components/PageHeader";

export function CoursesTable({ initialData, columns }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const response = await getAllCourses(search, page, pageSize); // Add page and pageSize
      if (response?.courses) {
        setData(response.courses);
        setTotalCount(response.totalCount || 0); // Set total count from response
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    setCurrentPage(1); // Reset to first page when searching
    fetchData(1, query);
  };


  const updateTable = async (): Promise<void> => {
    fetchData(currentPage, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, searchQuery);
  };

  const handleRemoveCourse = async (courseId: number) => {
    const res = await removeCourse(courseId);
    console.log(res);
    await updateTable();
    
    console.log("Removing course:", courseId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleSearch(searchQuery);
    }
  };

  useEffect(() => {
    updateTable();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => handleRemoveCourse(row.original.course_id)}
          variant="outline"
          size="sm"
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <PageHeader
          title="Course Management"
          description="Manage all university courses"
          actions={<DialogCreateCourse update={updateTable} />}
        />
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex w-full max-w-md items-center gap-2">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            <DataTable columns={columnsWithActions} data={data} />
          </div>
          
          {/* Pagination */}
          <div className="px-6 pb-6">
            <CustomPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalCount}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
