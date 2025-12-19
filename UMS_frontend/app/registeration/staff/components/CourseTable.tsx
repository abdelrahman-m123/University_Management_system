"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateCourse } from "./CreateCourse";
import Sidebar from "@/components/sidebar";
import { getAllApplications, AcceptApplication } from "../actions";
import { RejectApplication } from "../actions";

export function CoursesTable({ initialData }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const columns = [
    { accessorKey: "course_name", header: "Course Name" },
    { accessorKey: "credit_hours", header: "Credit Hours" },
    { accessorKey: "stu_email", header: "Email" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
    // { accessorKey: "registered_students", header: "Registered" },
    // { accessorKey: "max_registered_students", header: "Max Students" },
  ];

  const handleSearch = async (query: string = searchQuery) => {
    setIsLoading(true);
    try {
      const response = await getAllApplications(query);
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
      const response = await getAllApplications("");
      if (response?.courses) {
        setData(response.courses);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRegister = async (courseId: number, stu_id: number) => {
    const res = await AcceptApplication(courseId, stu_id);
    await updateTable();

    return res;
  };

  const handleRejectRegister = async (courseId: number, stu_id: number) => {
    const res = await RejectApplication(courseId, stu_id);
    await updateTable();

    return res;
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
        
        <DialogCreateCourse handleAccept={handleAcceptRegister} handleReject={handleRejectRegister} Row={row.original} />
        
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
              Course Applications
            </h1>
            {/* <DialogCreateCourse update={updateTable} /> */}
          </div>

          <div className="flex mb-4 w-full max-w-sm items-center gap-2">
            <Input
              placeholder="Search Applications..."
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