"use server";

import ProtectedRoute from "../../../components/ProtectedRoutes";
import { getAllCourses } from "./actions";
import { CoursesTable } from "./components/CourseTable";

const CourseApplication = async () => {
  const response = await getAllCourses("");
  const data = response?.courses ?? [];

  const columns = [
    { accessorKey: "course_name", header: "Course Name" },
    { accessorKey: "credit_hours", header: "Credit Hours" },
    { accessorKey: "registered_students", header: "Registered" },
    { accessorKey: "max_registered_students", header: "Max Students" },
  ];

  return (
    <ProtectedRoute allowedRoles={["staff", "admin"]}>
      <CoursesTable initialData={data} columns={columns} />
    </ProtectedRoute>
  );
};

export default CourseApplication;
