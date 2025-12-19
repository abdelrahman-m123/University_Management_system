"use client"
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { getStaffCourses } from "./actions";
import { useRouter } from "next/navigation";

interface Course {
  course_id: number;
  course_name: string;
  credit_hours: number;
}

const RegisteredCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const staff_id = localStorage.getItem("userId"); 
  console.log("Student ID:", staff_id);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getStaffCourses(staff_id);
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

    if (staff_id) {
      fetchCourses();
    } else {
      setError("Student ID not found");
      setLoading(false);
    }
  }, [staff_id]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-7xl bg-white rounded-lg p-6">
              <div className="text-center">Loading courses...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-7xl bg-white rounded-lg p-6">
              <div className="text-center text-red-600">{error}</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ padding: "20px", flex: 1 }}>
          <div className="max-w-7xl bg-white rounded-lg p-6">
            <h1 className="text-3xl font-semibold mb-2">Registered Courses</h1>
            <p className="text-sm text-black mb-6">{courses.length} course(s) registered</p>

            {courses.length === 0 ? (
              <div className="p-6 bg-white border rounded text-center text-black">
                You have no registered courses.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map((course) => {
                  const courseParts = course.course_name.split(": ");
                  const courseCode = courseParts[0] || "";
                  const courseTitle = courseParts[1] || course.course_name;
                  
                  return (
                    <div 
                      onClick={() => router.push(`/Courses/Doctor/${course.course_id}`)}
                      key={course.course_id} 
                      className="border rounded-lg p-4 shadow-md bg-white text-blue-900 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex flex-col h-full">
                        {/* Course Code */}
                        <div className="flex justify-between items-center text-sm">
                        <div className="text-sm font-semibold text-gray-600 mb-1">
                          {courseCode}
                        </div>
                            <span className="font-semibold">{course.credit_hours}</span>
                        
                        </div>
                        
                        {/* Course Title */}
                        <h2 className="text-lg font-medium mb-2 flex-grow">
                          {courseTitle}
                        </h2>
                        
                        
                       
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegisteredCourses;