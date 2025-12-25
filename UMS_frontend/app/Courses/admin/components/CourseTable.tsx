"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateCourse } from "./CreateCourse";
import Sidebar from "@/components/sidebar";
import { getAllCourses, removeCourse } from "../actions";
import { CustomPagination } from "@/components/CustomPagination"; // Add this import

export function CoursesTable({ initialData, columns }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Update fetchData function to include pagination
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

  // Update updateTable to use pagination
  const updateTable = async (): Promise<void> => {
    fetchData(currentPage, searchQuery);
  };

  // Add page change handler
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
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-semibold text-gray-800">
              Course Management
            </h1>
            <DialogCreateCourse update={updateTable} />
          </div>

          <div className="flex mb-4 w-full max-w-sm items-center gap-2">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={() => handleSearch(searchQuery)} disabled={isLoading}>
              {isLoading ? "..." : "Search"}
            </Button>
          </div>

          <DataTable columns={columnsWithActions} data={data} />
        </div>
        
        {/* Add CustomPagination component */}
        <div className="mt-4">
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}