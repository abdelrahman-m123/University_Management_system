"use client"
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { getStaffCourses } from "./actions";
import { getUserData } from "@/common/cookieHelpers";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

interface Course {
  course_id: number;
  course_code?: string;
  course_name?: string | null;
  credit_hours: number;
}

const RegisteredCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveStaffId = async () => {
      const localId = Number(localStorage.getItem("userId"));
      if (Number.isInteger(localId)) {
        setStaffId(localId);
        return;
      }

      const userData = await getUserData();
      const cookieId = Number(userData?.userId);
      if (!cancelled && Number.isInteger(cookieId)) {
        localStorage.setItem("userId", cookieId.toString());
        setStaffId(cookieId);
        return;
      }

      if (!cancelled) {
        setError("Staff ID not found");
        setLoading(false);
      }
    };

    resolveStaffId();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getStaffCourses(staffId ?? 0);
        console.log("API Response: ", response);
        
        if (response && response.courses) {
          setCourses(response.courses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        setError("Failed to fetch courses");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    if (staffId !== null) {
      fetchCourses();
    }
  }, [staffId]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">Loading courses...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">{error}</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title="Assigned Courses"
            description={`${courses.length} course(s) assigned`}
          />
          <div className="mx-auto max-w-7xl">
            <div className="py-2">
              {courses.length === 0 ? (
                <div className="p-12 border border-slate-200 rounded-xl text-center text-slate-400 bg-slate-50">
                  No courses assigned to you yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {courses.map((course) => {
                    const courseName = course.course_name ?? "";
                    const courseParts = courseName.split(": ");
                    const courseCode = course.course_code || (courseParts.length > 1 ? courseParts[0] : "");
                    const courseTitle = (courseParts.length > 1 ? courseParts.slice(1).join(": ") : courseName) || "Untitled course";
                    
                    return (
                      <Link
                        href={`/Courses/Doctor/${course.course_id}`}
                        key={course.course_id} 
                        className="group rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-center text-sm">
                            <div className="text-sm font-semibold text-gray-600 mb-1">
                              {courseCode}
                            </div>
                            <span className="font-semibold">{course.credit_hours}</span>
                          </div>

                          <h2 className="text-lg font-medium mb-2 flex-grow">
                            {courseTitle}
                          </h2>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegisteredCourses;
