"use server";

import ProtectedRoute from "../../../components/ProtectedRoutes";
import { CoursesTable } from "./components/CourseTable";

const CourseApplication = async () => {
 


  return (
    <ProtectedRoute allowedRoles={["staff", "admin", "student"]}>
      <CoursesTable />
    </ProtectedRoute>
  );
};

export default CourseApplication;
