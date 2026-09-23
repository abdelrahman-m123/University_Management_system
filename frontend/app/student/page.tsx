// pages/dashboard.tsx
"use client"
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";
import { PageHeader } from "@/components/PageHeader";

const Dashboard: React.FC = () => {
  const [student, setStudent] = useState<string | null>(null);

  useEffect(() => {
    setStudent(localStorage.getItem("username"));
  }, []);

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title="Student Dashboard"
            description={student ? `Welcome ${student}` : "University management overview"}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
