// pages/dashboard.tsx
import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";
import { PageHeader } from "@/components/PageHeader";

const Dashboard: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={["student", "staff", "admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader title="Dashboard" description="University management overview" />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
