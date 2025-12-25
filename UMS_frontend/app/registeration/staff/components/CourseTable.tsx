"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogReviewApplication } from "./ReviewApplication";
import Sidebar from "@/components/sidebar";
import { getAllApplications, AcceptApplication } from "../actions";
import { RejectApplication } from "../actions";
import { CustomPagination } from "@/components/CustomPagination"; // Add this import

export function CoursesTable({ initialData }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize: number = 5;
  const [totalCount, setTotalCount] = useState(0);

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
  ];

  // Update fetchData function to include pagination
  const fetchData = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const response = await getAllApplications(search, page, pageSize);
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
        <DialogReviewApplication 
          handleAccept={handleAcceptRegister} 
          handleReject={handleRejectRegister} 
          Row={row.original} 
        />
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
          </div>

          <div className="flex mb-4 w-full max-w-sm items-center gap-2">
            <Input
              placeholder="Search Applications..."
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