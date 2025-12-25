"use server";

import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogCreateCourse } from "./components/ReviewApplication";
import { getAllApplications } from "./actions";
import { CoursesTable } from "./components/CourseTable";

const CourseApplication = async () => {
  const response = await getAllApplications("");
  const data = response?.courses ?? [];
  const totalCount = response.totalCount;

  

  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <CoursesTable initialData={data} inialCount={totalCount}  />
    </ProtectedRoute>
  );
};

export default CourseApplication;
