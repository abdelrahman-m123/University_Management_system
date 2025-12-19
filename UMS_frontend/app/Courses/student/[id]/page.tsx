"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoutes";
import Sidebar from "../../../../components/sidebar";
import { getCourse, getQuizzes } from "../actions";

interface StaffMember {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  staff_role: string;
}

interface Quiz {
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
}

interface CourseDetails {
  course_id: number;
  course_name: string;
  credit_hours: number;
  registered_students: number;
  max_registered_students: number;
  assigned_staff: StaffMember[];
}

const CoursePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await getCourse(courseId);
        console.log("Course response:", response);
        
        if (response.success && response.course) {
          setCourse(response.course);
        } else {
          console.error("Failed to fetch course:", response.message);
        }

        // TODO: Replace with actual getQuizzes action
        const quizzesResponse = await getQuizzes(courseId);
        // setQuizzes(quizzesResponse.quizzes || []);

        // Mock quizzes data
        const mockQuizzes: Quiz[] = quizzesResponse;
        setQuizzes(mockQuizzes);

      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center">Loading course details...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center text-red-600">Course not found</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const courseParts = course.course_name.split(": ");
  const courseCode = courseParts[0] || "";
  const courseTitle = courseParts[1] || course.course_name;

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ padding: "20px", flex: 1 }}>
          <div className="max-w-6xl ">
            {/* Header */}
            <div className="bg-white rounded-xl text-blue-900 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-semibold mb-2">{courseTitle}</h1>
                  <p className="text-xl text-gray">{courseCode}</p>
                  <p className="text-gray mt-2">{course.credit_hours} Credit Hours</p>
                </div>
                <div className="text-right">
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "quizzes"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Quizzes
                  </button>
                  <button
                    onClick={() => setActiveTab("staff")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "staff"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Staff
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "quizzes" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Quizzes</h2>
                    {quizzes.length > 0 ? (
                      <div className="space-y-4">
                        {quizzes.map((quiz) => (
                          <div key={quiz.quiz_id} className="border p-4 rounded-lg">
                            <h3 className="font-semibold">{quiz.quiz_title}</h3>
                            <a 
                              href={quiz.google_form_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-900 hover:underline"
                            >
                              Take Quiz
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No quizzes available for this course</p>
                    )}
                  </div>
                )}

                {activeTab === "staff" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Assigned Staff</h2>
                    {course.assigned_staff.length > 0 ? (
                      <div className="flex gap-4">
                        {course.assigned_staff.map((staff) => (
                          <div key={staff.staff_id} className="border p-4 rounded-lg">
                            <h3 className="font-semibold">{staff.staff_name}</h3>
                            <p className="text-gray-600">{staff.staff_email}</p>
                            <p className="text-gray-600">Role: {staff.staff_role}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No staff assigned to this course</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default CoursePage;