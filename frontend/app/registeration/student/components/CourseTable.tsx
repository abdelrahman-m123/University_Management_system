"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";
import { getAllCourses } from "../actions";
import { DialogCreateCourse } from "./RegisterCourse";
import { leaveCourseWaitlist } from "../actions";
import { getRealtimeToken } from "../actions";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { CustomPagination } from "@/components/CustomPagination"; 
import { PageHeader } from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CourseRow = Record<string, any>;

export function CoursesTable() {
  const [data, setData] = useState<CourseRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stuId, setStuId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterId, setSemesterId] = useState<string>("");
  const [liveStatus, setLiveStatus] = useState<"live" | "offline">("offline");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setStuId(Number(id));
  }, []);

  const fetchData = async (page: number = currentPage, search: string = "") => {
    if (stuId === null) return;
    
    try {
      // Pass page and pageSize to getAllCourses
      const response = await getAllCourses(search, stuId, page, pageSize, semesterId ? Number(semesterId) : undefined);
      if (response?.courses) {
        setData(response.courses);
        setTotalCount(response.totalCount || 0); // Set total count from response
        setSemesters(response.semesters ?? []);
        if (!semesterId && response.semester?.id) setSemesterId(String(response.semester.id));
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  useEffect(() => {
    if (stuId === null) return;
    fetchData(1, "");
  }, [stuId]);

  useEffect(() => {
    if (stuId !== null && semesterId) fetchData(1, searchQuery);
  }, [semesterId]);

  useEffect(() => {
    if (stuId === null || data.length === 0) return;
    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5219"}/hubs/enrollment`, { accessTokenFactory: async () => (await getRealtimeToken()) ?? "" })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
    connection.on("EnrollmentUpdated", () => { void fetchData(currentPage, searchQuery); });
    let active = true;
    const start = async () => {
      try {
        setLiveStatus("offline");
        await connection.start();
        if (active) { setLiveStatus("live"); for (const course of data) await connection.invoke("SubscribeOffering", course.course_id); }
      } catch { setLiveStatus("offline"); /* HTTP refresh remains available if live updates are unavailable. */ }
    };
    void start();
    return () => { active = false; void connection.stop(); };
  }, [stuId, data.map((course) => course.course_id).join(",")]);

  const handleSearch = async (query: string = searchQuery) => {
    if (stuId === null) return;
    setCurrentPage(1); // Reset to page 1 when searching
    fetchData(1, query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      case "waitlisted":
        return "bg-purple-100 text-purple-800";
      case "not applied":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { accessorKey: "course_name", header: "Course Name" },
    { accessorKey: "credit_hours", header: "Credit Hours" },
    {
      accessorKey: "remaining_seats", header:"Remaining Seats",
      cell: ({row}: { row: {original: CourseRow} }) =>{
        const enrollements = row.original.enrollment_count;
        const totalAvailable = row.original.max_registered_students;
        return(
          <>{`${enrollements} out of ${totalAvailable}`}</>
        )
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: CourseRow } }) => {
        const status = row.original.status;
        const displayStatus = status ?? "Not applied";
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
              displayStatus
            )}`}
          >
            {displayStatus}
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
      cell: ({ row }: { row: { original: CourseRow } }) => {
        if (row.original.status === "Waitlisted") return <button className="text-sm text-red-700 underline" onClick={async () => { if (stuId !== null) { await leaveCourseWaitlist(row.original.course_id, stuId); await handleUpdate(); } }}>Leave waitlist</button>;
        if (row.original.status) return <p>{row.original.status}</p>;
        if (!["Registration Open", "Add/Drop Open"].includes(row.original.phase)) return <p className="text-slate-500">Registration closed</p>;
        if (row.original.enrollment_count >= row.original.max_registered_students) return <DialogCreateCourse Row={row.original} handleUpdate={handleUpdate} waitlist />;
        return <DialogCreateCourse Row={row.original} handleUpdate={handleUpdate} />;
      },
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Course Registration"
          description={<span>Browse available courses and track your applications · <span className={liveStatus === "live" ? "text-emerald-600" : "text-slate-400"}>{liveStatus === "live" ? "Live updates on" : "Live updates unavailable"}</span></span>}
        />
        <div className="mx-auto max-w-7xl pt-6">
          <div className="space-y-4">

          <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row">
            <Input
              aria-label="Search courses"
              className="min-w-0 flex-1"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch(searchQuery);
                }
              }}
            />
            <Select value={semesterId} onValueChange={(value) => { setSemesterId(value); setCurrentPage(1); }}>
              <SelectTrigger aria-label="Semester" className="w-full sm:w-64"><SelectValue placeholder="Select semester" /></SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => <SelectItem key={semester.id} value={String(semester.id)}>{semester.academicYearName} {semester.name} · {semester.phase}</SelectItem>)}
              </SelectContent>
            </Select>
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
      </main>
    </div>
  );
}
