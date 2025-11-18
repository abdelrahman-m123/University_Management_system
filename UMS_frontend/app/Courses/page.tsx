import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";

const RegisteredCourses: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <h1>registered Courses</h1>
          
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RegisteredCourses;
