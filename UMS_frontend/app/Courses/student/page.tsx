"use client"
import { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import { getStudentCourses, getCalendar } from "./actions";
import { useRouter } from "next/navigation";
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle, ChevronRight } from "lucide-react";

interface Course {
  course_id: number;
  course_name: string;
  credit_hours: number;
}

interface QuizEvent {
  course_name: string;
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
  open_date: string;
  close_date: string;
  is_visible: boolean;
}

const RegisteredCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizEvents, setQuizEvents] = useState<QuizEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "calendar">("courses");
  const router = useRouter();

  const stu_id = localStorage.getItem("userId"); 
  console.log("Student ID:", stu_id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCalendarLoading(true);
        
        // Fetch courses
        const coursesResponse = await getStudentCourses(stu_id);
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

    if (stu_id) {
      fetchData();
    } else {
      setError("Student ID not found");
      setLoading(false);
      setCalendarLoading(false);
    }
  }, [stu_id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizStatus = (openDate: string, closeDate: string) => {
    const now = new Date();
    const open = new Date(openDate);
    const close = new Date(closeDate);
    
    if (now < open) return "upcoming";
    if (now >= open && now <= close) return "active";
    return "closed";
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-7xl bg-white rounded-lg p-6">
              <div className="text-center">Loading your dashboard...</div>
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
          <div className="max-w-7xl space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg p-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
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
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "courses" ? (
              <div className="bg-white rounded-lg p-6">
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
                          onClick={() => router.push(`/Courses/student/${course.course_id}`)}
                          key={course.course_id} 
                          className="border rounded-lg p-4 shadow-sm bg-white text-blue-900 hover:shadow-md transition-shadow duration-200 cursor-pointer"
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
            ) : (
              <div className="bg-white rounded-lg p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-semibold mb-2">Quiz Calendar</h1>
                  <p className="text-sm text-black">
                    Upcoming and active quizzes across all your courses
                  </p>
                </div>

                {calendarLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading quiz calendar...</p>
                  </div>
                ) : quizEvents.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes scheduled</h3>
                    <p className="text-gray-600">You don't have any upcoming quizzes at the moment.</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    
                    {/* Scrollable Quiz List */}
                    <div className="w-full">
                      <div className="max-h-[300px] overflow-y-auto pr-2">
                        <div className="space-y-3">
                          {quizEvents.map((quiz, index) => {
                            const status = getQuizStatus(quiz.open_date, quiz.close_date);
                            const courseParts = quiz.course_name.split(": ");
                            const courseCode = courseParts[0] || "";
                            
                            return (
                              <div 
                                key={quiz.quiz_id} 
                                className={`border rounded-lg p-3 ${
                                  status === "active" ? "border-green-200 bg-green-50" :
                                  status === "upcoming" ? "border-blue-200 bg-blue-50" :
                                  "border-gray-200 bg-gray-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Status Indicator */}
                                  <div className={`w-2 h-full rounded ${
                                    status === "active" ? "bg-green-500" :
                                    status === "upcoming" ? "bg-blue-500" :
                                    "bg-gray-400"
                                  }`}></div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                          status === "active" ? "bg-green-100 text-green-800" :
                                          status === "upcoming" ? "bg-blue-100 text-blue-800" :
                                          "bg-gray-100 text-gray-800"
                                        }`}>
                                          {status === "active" ? "ACTIVE" :
                                           status === "upcoming" ? "UPCOMING" : "CLOSED"}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">{courseCode}</span>
                                      </div>
                                      
                                      {status === "active" && (
                                        <a
                                          href={quiz.google_form_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                                        >
                                          Take Quiz
                                        </a>
                                      )}
                                    </div>
                                    
                                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                      {quiz.quiz_title}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{formatDate(quiz.open_date)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{formatTime(quiz.open_date)} - {formatTime(quiz.close_date)}</span>
                                      </div>
                                    </div>
                                    
                                    {status === "active" && (
                                      <div className="mt-2 pt-2 border-t border-green-200">
                                        <div className="flex items-center justify-between">
                                          <div className="text-xs text-green-700 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Accepting submissions
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Closes {formatTime(quiz.close_date)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {status === "upcoming" && (
                                      <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                        <Clock size={12} />
                                        Opens in {Math.ceil((new Date(quiz.open_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default RegisteredCourses;