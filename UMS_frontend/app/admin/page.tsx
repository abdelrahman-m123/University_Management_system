// pages/dashboard.tsx
import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";

const Dashboard: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <h1>Dashboard</h1>
          <p>landing page with uni logo</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
