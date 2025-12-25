"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";
import { getAllCourses } from "../actions";
import { DialogCreateCourse } from "./RegisterCourse";
import { CustomPagination } from "@/components/CustomPagination"; // Add this import

export function CoursesTable() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stuId, setStuId] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add these pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Load student ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setStuId(Number(id));
  }, []);

  // Update fetchData to use pagination
  const fetchData = async (page: number = currentPage, search: string = "") => {
    if (stuId === null) return;
    
    setIsLoading(true);
    try {
      // Pass page and pageSize to getAllCourses
      const response = await getAllCourses(search, stuId, page, pageSize);
      if (response?.courses) {
        setData(response.courses);
        setTotalCount(response.totalCount || 0); // Set total count from response
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update initial fetch to use fetchData function
  useEffect(() => {
    if (stuId === null) return;
    fetchData(1, "");
  }, [stuId]);

  // Update handleSearch to reset to page 1
  const handleSearch = async (query: string = searchQuery) => {
    if (stuId === null) return;
    setCurrentPage(1); // Reset to page 1 when searching
    fetchData(1, query);
  };

  // Add page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };
  
  const handleUpdate = () => {
    fetchData(currentPage, searchQuery); // Use current page when updating
  };

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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
              row.original.status
            )}`}
          >
            {row.original.status}
          </span>
        );
      },
    },
  ];

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return row.original.status === null ? (
          <DialogCreateCourse Row={row.original} handleUpdate={handleUpdate} />
        ) : (
          <p>Application Sent</p>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-semibold text-gray-800">
              Courses Offered
            </h1>
          </div>

          <div className="flex mb-4 w-full max-w-sm items-center gap-2">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleInputChange}
            />
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={isLoading}
            >
              Search
            </Button>
          </div>

          <DataTable columns={columnsWithActions} data={data} />
        </div>
        
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