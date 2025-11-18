import { DataTable } from "@/components/ui/datatable";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CourseRegisteration: React.FC = () => {
  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "studentName", header: "Student Name" },
    { accessorKey: "courseName", header: "Course Name" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "date", header: "Application Date" },
  ];

  const data = [
    {
      id: 1,
      studentName: "Ahmed Hassan",
      courseName: "Data Structures",
      status: "Pending",
      date: "2025-11-15",
    },
    {
      id: 2,
      studentName: "Fatima Ali",
      courseName: "Web Development",
      status: "Approved",
      date: "2025-11-14",
    },
    {
      id: 3,
      studentName: "Mohamed Karim",
      courseName: "Database Design",
      status: "Rejected",
      date: "2025-11-13",
    },
    {
      id: 4,
      studentName: "Layla Ahmed",
      courseName: "Algorithms",
      status: "Pending",
      date: "2025-11-12",
    },
    {
      id: 5,
      studentName: "Omar Ibrahim",
      courseName: "Software Engineering",
      status: "Approved",
      date: "2025-11-11",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1, flexDirection: "column" }}>
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-4xl font-semibold mb-6 text-gray-800">
              Course Applications
            </h1>
            <div className="flex mb-4 w-full max-w-sm items-center gap-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit" variant="">
                Search
              </Button>
            </div>
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseRegisteration;