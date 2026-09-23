"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogReviewApplication } from "./ReviewApplication";
import Sidebar from "@/components/sidebar";
import { getAllApplications, AcceptApplication, getApplicationSemesters } from "../actions";
import { RejectApplication } from "../actions";
import { CustomPagination } from "@/components/CustomPagination"; // Add this import
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ApplicationRow = Record<string, any>;

export function CoursesTable({ initialData }: { initialData: ApplicationRow[] }) {
  const [data, setData] = useState<ApplicationRow[]>(initialData ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize: number = 5;
  const [totalCount, setTotalCount] = useState(0);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState("");

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
      cell: ({ row }: { row: { original: ApplicationRow } }) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      ),
    },
  ];

  const fetchData = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const response = await getAllApplications(search, page, pageSize, semesterId ? Number(semesterId) : undefined);
      if (response?.applications) {
        setData(response.applications);
        setTotalCount(response.total ?? 0);
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

  const handleAcceptRegister = async (courseId: number, stu_id: number, status?: string) => {
    const res = await AcceptApplication(courseId, stu_id, status);
    await updateTable();
    return res;
  };

  const handleRejectRegister = async (courseId: number, stu_id: number, status?: string) => {
    const res = await RejectApplication(courseId, stu_id, status);
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
    void getApplicationSemesters().then((result) => setSemesters(result.semesters ?? []));
    fetchData(1, searchQuery);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => { setCurrentPage(1); fetchData(1, searchQuery); }, [semesterId]);

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: ApplicationRow } }) => (
        row.original.status === "Pending" || row.original.status === "Withdrawal Requested" ? <DialogReviewApplication 
          handleAccept={handleAcceptRegister} 
          handleReject={handleRejectRegister} 
          Row={row.original} 
        /> : <span className="text-sm text-slate-500">{row.original.status}</span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <PageHeader
          title="Course Applications"
          description="Review and manage student course registration requests"
        />
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <Select value={semesterId || "all"} onValueChange={(value) => setSemesterId(value === "all" ? "" : value)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="All semesters" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All semesters</SelectItem>{semesters.map((semester) => <SelectItem key={semester.id} value={String(semester.id)}>{semester.academicYearName} {semester.name}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex w-full max-w-md items-center gap-2">
              <Input
                placeholder="Search applications..."
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
