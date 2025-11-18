// pages/dashboard.tsx
"use client"
import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";

const Dashboard: React.FC = () => {

  const student = localStorage.getItem("username");
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <h1>Dashboard for students</h1>
          <p></p>
          {student ? <p>Welcome {student}</p> : null}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
