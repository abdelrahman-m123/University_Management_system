"use server";

import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogCreateCourse } from "./components/CreateCourse";
import { getAllApplications } from "./actions";
import { CoursesTable } from "./components/CourseTable";

const CourseApplication = async () => {
  const response = await getAllApplications("");
  const data = response?.courses ?? [];

  

  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <CoursesTable initialData={data}  />
    </ProtectedRoute>
  );
};

export default CourseApplication;
