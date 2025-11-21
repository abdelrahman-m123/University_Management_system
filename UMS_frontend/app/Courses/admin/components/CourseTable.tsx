"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateCourse } from "./CreateCourse";
import Sidebar from "@/components/sidebar";
import { getAllCourses, removeCourse } from "../actions";

export function CoursesTable({ initialData, columns }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string = searchQuery) => {
    setIsLoading(true);
    try {
      const response = await getAllCourses(query);
      if (response?.courses) {
        setData(response.courses);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTable = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllCourses("");
      if (response?.courses) {
        setData(response.courses);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
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

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500); // 500ms delay
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
              search
            </Button>
          </div>

          <DataTable columns={columnsWithActions} data={data} />
        </div>
      </div>
    </div>
  );
}