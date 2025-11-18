import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";

const CourseRegisteration: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <h1>Available Courses</h1>
          
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseRegisteration;
