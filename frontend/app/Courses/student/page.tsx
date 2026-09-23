"use client"
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { getStudentCourses, getCalendar, requestCourseWithdrawal } from "./actions";
import { getUserData } from "@/common/cookieHelpers";
import Link from "next/link";
import { Calendar, BookOpen } from "lucide-react";
import { QuizCalendar, type QuizCalendarEvent } from "../../../components/QuizCalendar";
import { PageHeader } from "@/components/PageHeader";

interface Course {
  course_id: number;
  course_name: string;
  credit_hours: number;
  status: string;
  course_offering_id: number;
  semester_name: string;
  semester_phase: string;
  can_request_withdrawal: boolean;
}

const RegisteredCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizEvents, setQuizEvents] = useState<QuizCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "calendar">("courses");
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveStudentId = async () => {
      const localId = Number(localStorage.getItem("userId"));
      if (Number.isInteger(localId)) {
        setStudentId(localId);
        return;
      }

      const userData = await getUserData();
      const cookieId = Number(userData?.userId);
      if (!cancelled && Number.isInteger(cookieId)) {
        localStorage.setItem("userId", cookieId.toString());
        setStudentId(cookieId);
        return;
      }

      if (!cancelled) {
        setError("Student ID not found");
        setLoading(false);
        setCalendarLoading(false);
      }
    };

    resolveStudentId();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCalendarLoading(true);
        
        // Fetch courses
        const coursesResponse = await getStudentCourses(studentId ?? 0);
        console.log("Courses API Response: ", coursesResponse);
        
        if (coursesResponse && coursesResponse.courses) {
          setCourses(coursesResponse.courses);
        } else {
          setCourses([]);
        }

        // Fetch calendar events (quizzes)
        const calendarResponse = await getCalendar();
        console.log("Calendar API Response: ", calendarResponse);
        
        if (calendarResponse && calendarResponse.success && calendarResponse.result) {
          setQuizEvents(calendarResponse.result);
        } else {
          setQuizEvents([]);
        }
        
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setCalendarLoading(false);
      }
    };

    if (studentId !== null) {
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">Loading your dashboard...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
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
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title={activeTab === "courses" ? "Registered Courses" : "Quiz Calendar"}
            description={
              activeTab === "courses"
                ? `${courses.length} course(s) registered`
                : "Upcoming and active quizzes across all your courses"
            }
            tabs={
              <nav className="flex min-w-max gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === "courses"
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <BookOpen size={16} />
                  My Courses ({courses.length})
                </button>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === "calendar"
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Calendar size={16} />
                  Quiz Calendar ({quizEvents.length})
                </button>
              </nav>
            }
          />
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Tab Content */}
            {activeTab === "courses" ? (
              <div className="py-2">
                {courses.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                    You have no registered courses.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {courses.map((course) => {
                      const courseParts = course.course_name.split(": ");
                      const courseCode = courseParts[0] || "";
                      const courseTitle = courseParts[1] || course.course_name;
                      
                      return (
                        <article key={course.course_id} className="rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
                          <Link href={`/Courses/student/${course.course_id}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                          <div className="flex flex-col">
                            {/* Course Code */}
                            <div className="flex justify-between items-center text-sm">
                              <div className="text-sm font-semibold text-gray-600 mb-1">
                                {courseCode}
                              </div>
                                <span className="font-semibold">{course.credit_hours} credits</span>
                            </div>
                            
                            {/* Course Title */}
                            <h2 className="text-lg font-medium mb-2 flex-grow">
                              {courseTitle}
                            </h2>
                            <p className="text-sm text-slate-500">{course.semester_name} · {course.semester_phase}</p>
                            <span className="mt-2 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{course.status}</span>
                          </div>
                          </Link>
                          {course.can_request_withdrawal && studentId !== null && <button className="mt-4 text-sm font-medium text-red-700 hover:text-red-900" onClick={async () => {
                            if (!window.confirm(`Request to withdraw from ${course.course_name}?`)) return;
                            const result = await requestCourseWithdrawal(course.course_offering_id, studentId);
                            if (result.success) setCourses((current) => current.map((item) => item.course_id === course.course_id ? { ...item, status: "Withdrawal Requested", can_request_withdrawal: false } : item));
                            else window.alert(result.error ?? "Could not submit withdrawal request.");
                          }}>Request withdrawal</button>}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                <QuizCalendar events={quizEvents} loading={calendarLoading} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegisteredCourses;
