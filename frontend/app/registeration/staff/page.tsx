"use server";

import ProtectedRoute from "../../../components/ProtectedRoutes";
import { getAllApplications } from "./actions";
import { CoursesTable } from "./components/CourseTable";

const CourseApplication = async () => {
  const response = await getAllApplications("");
  const data = response?.applications ?? [];

  

  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <CoursesTable initialData={data} />
    </ProtectedRoute>
  );
};

export default CourseApplication;
