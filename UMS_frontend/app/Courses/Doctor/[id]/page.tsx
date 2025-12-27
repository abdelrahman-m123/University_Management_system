"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoutes";
import Sidebar from "../../../../components/sidebar";
import {
  getCourse,
  getQuizzes,
  getRegisteredStudents,
  getGrades,
  getAnnouncements,
  deleteAnnouncement,
  getClassGrades,
  getQuestionaires,
} from "../actions";
import { Input } from "@/components/ui/input";
import { DialogCreateQuiz } from "./components/CreateQuiz";
import { StudentsTable } from "./components/StudentsTable";
import { ClassworkGradesTable } from "./components/ClassworkGradesTable";
import { StudentGradesTable } from "./components/StudentsGrades";
import { DialogCreateAnnouncement } from "./components/CreateAnnoucment";
import { getUserData } from "@/common/cookieHelpers";
import { DialogEditAnnouncement } from "./components/EditAnnouncement";
import { Button } from "@/components/ui/button";
import { DialogCreateQuestion } from "./components/CreateQuestionaire";
import { DialogSetQuizDueDate } from "./components/DialogSetQuizDueDate";
interface Questionnaire {
  question_text: string;
  questionnaire_id: number;
}

interface StaffMember {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  staff_role: string;
}
interface ClassworkGrade {
  stu_id: number;
  stu_name: string;
  stu_email: string;
  grades: {
    midterm_grade?: number;
    classwork_grade?: number;
    quizes_grade?: number;
    final_grade?: string;
  };
}
interface Quiz {
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
  created_at: string;
}

interface Student {
  stu_id: number;
  stu_name: string;
  stu_email: string;
  academic_year: string;
  grade?: string;
}

interface StudentGrade {
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
  quiz_grade: string;
  stu_id: number;
  stu_email: string;
  stu_name: string;
}

interface CourseDetails {
  course_id: number;
  course_name: string;
  credit_hours: number;
  registered_students: number;
  max_registered_students: number;
  assigned_staff: StaffMember[];
}

interface Announcement {
  staff_name: string;
  staff_email: string;
  ann_title: string;
  ann_content: string;
  comments: any;
  staff_id: number;
  ann_id: number;
}

const CoursePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quizzes");
  const [staff_id, setStaff_id] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [classworkGrades, setClassworkGrades] = useState<ClassworkGrade[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await getCourse(courseId);
        const userData = await getUserData();

        setStaff_id(userData.userId);

        if (response.success && response.course) {
          setCourse(response.course);
        } else {
          console.error("Failed to fetch course:", response.message);
        }

        const announcementsResponse = await getAnnouncements(courseId);
        if (announcementsResponse.success) {
          setAnnouncements(announcementsResponse.result || []);
        }

        const quizzesResponse = await getQuizzes(courseId);
        setQuizzes(quizzesResponse || []);

        const studentsResponse = await getRegisteredStudents(
          parseInt(courseId as string)
        );
        setStudents(studentsResponse.students || []);

        const gradesResponse = await getGrades(parseInt(courseId as string));
        setGrades(gradesResponse || []);

        const classworkResponse = await getClassGrades(
          parseInt(courseId as string)
        );
        if (classworkResponse.success && classworkResponse.students) {
          setClassworkGrades(classworkResponse.students || []);
        }

        const questionnairesResponse = await getQuestionaires(
          parseInt(courseId as string)
        );
        if (questionnairesResponse.success && questionnairesResponse.result) {
          setQuestionnaires(questionnairesResponse.result || []);
        }
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

  const handleCommentInputChange = (annId: number, value: string) => {
    setCommentInputs({
      ...commentInputs,
      [annId]: value,
    });
  };

  const handleSubmitComment = async (annId: number) => {
    const commentText = commentInputs[annId];
    if (!commentText?.trim()) return;

    try {
      console.log(`Submitting comment for announcement ${annId}:`, commentText);

      setCommentInputs({
        ...commentInputs,
        [annId]: "",
      });

      await UpdatePage();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleSetQuizDueDate = async () => {
    return null;
  }

  const handleDeleteAnnouncement = async (annId: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        const response = await deleteAnnouncement(annId);
        if (response.success) {
          // Refresh announcements after successful deletion
          await UpdatePage();
        } else {
          console.error("Failed to delete announcement:", response.message);
          alert("Failed to delete announcement");
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Error deleting announcement");
      }
    }
  };

  const UpdatePage = async () => {
    try {
      setLoading(true);
      const response = await getCourse(courseId);

      if (response.success && response.course) {
        setCourse(response.course);
      } else {
        console.error("Failed to fetch course:", response.message);
      }

      const announcementsResponse = await getAnnouncements(courseId);
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.result || []);
      }

      const quizzesResponse = await getQuizzes(courseId);
      setQuizzes(quizzesResponse || []);

      const studentsResponse = await getRegisteredStudents(
        parseInt(courseId as string)
      );
      setStudents(studentsResponse.students || []);

      const gradesResponse = await getGrades(parseInt(courseId as string));
      setGrades(gradesResponse || []);

      const classworkResponse = await getClassGrades(
        parseInt(courseId as string)
      );
      console.log(classworkResponse);
      if (classworkResponse.success && classworkResponse.students) {
        setClassworkGrades(classworkResponse.students || []);
      }

      const questionnairesResponse = await getQuestionaires(
        parseInt(courseId as string)
      );
      if (questionnairesResponse.success && questionnairesResponse.result) {
        setQuestionnaires(questionnairesResponse.result || []);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeUpdate = async () => {
    const studentsResponse = await getRegisteredStudents(
      parseInt(courseId as string)
    );
    setStudents(studentsResponse.students || []);

    const gradesResponse = await getGrades(parseInt(courseId as string));
    setGrades(gradesResponse || []);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
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
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
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
    <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ padding: "20px", flex: 1 }}>
          <div className="max-w-6xl ">
            <div className="bg-white rounded-xl text-blue-900 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-semibold mb-2">{courseTitle}</h1>
                  <p className="text-xl text-gray">{courseCode}</p>
                  <p className="text-gray mt-2">
                    {course.credit_hours} Credit Hours
                  </p>
                </div>
                <div className="text-right flex gap-3">
                  <DialogCreateQuiz
                    courseId={courseId as string}
                    handleUpdate={UpdatePage}
                  />
                  <DialogCreateQuestion
                    courseId={courseId as string}
                    handleUpdate={UpdatePage}
                  />
                </div>
              </div>
            </div>

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
                    onClick={() => setActiveTab("students")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "students"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Students
                  </button>
                  <button
                    onClick={() => setActiveTab("grades")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "grades"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Quiz Grades
                  </button>
                  <button
                    onClick={() => setActiveTab("classwork")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "classwork"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Classwork Grades
                  </button>
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "announcements"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Announcements
                  </button>
                  <button
                    onClick={() => setActiveTab("questionnaires")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "questionnaires"
                        ? "border-blue-900 text-blue-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Questionnaires
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

              <div className="mt-6">
                {activeTab === "questionnaires" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Course Questionnaires
                    </h2>
                    {questionnaires.length > 0 ? (
                      <div className="space-y-4">
                        {questionnaires.map((questionnaire, index) => {


                          return (
                            <div
                              key={questionnaire.questionnaire_id}
                              className="border p-4 rounded-lg"
                            >
                              <h3 className="font-semibold mb-2">
                                Questionnaire {index + 1}
                              </h3>
                              <a
                                href={questionnaire.question_text}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-900 hover:underline inline-flex items-center gap-2"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                Open Questionnaire Form
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No questionnaires available for this course
                      </p>
                    )}
                  </div>
                )}
                {activeTab === "classwork" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">
                        Classwork Grades
                      </h2>
                      {/* You could add an export button or other actions here */}
                    </div>

                    {classworkGrades.length > 0 ? (
                      <ClassworkGradesTable
                        classworkGrades={classworkGrades}
                        courseId={courseId as string}
                      />
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                          No classwork grades available for this course
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "quizzes" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Quizzes</h2>
                    {quizzes.length > 0 ? (
                      <div className="space-y-4">
                        {quizzes.map((quiz) => (
                          <div
                            key={quiz.quiz_id}
                            className="border p-4 rounded-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {quiz.quiz_title}
                                </h3>
                                <a
                                  href={quiz.google_form_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-900 hover:underline"
                                >
                                  Open Quiz
                                </a>
                                {quiz.due_date && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Due:{" "}
                                    {new Date(quiz.due_date).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <DialogSetQuizDueDate
                                quizId={quiz.quiz_id}
                                quizTitle={quiz.quiz_title}
                                onSetDueDate={handleSetQuizDueDate}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No quizzes available for this course
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "students" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Registered Students
                    </h2>
                    <StudentsTable
                      courseId={courseId}
                      students={students}
                      quizzes={quizzes}
                      onGradeUpdate={handleGradeUpdate}
                    />
                  </div>
                )}

                {activeTab === "grades" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Student Grades
                    </h2>
                    <StudentGradesTable grades={grades} course_id={courseId} />
                  </div>
                )}

                {activeTab === "announcements" && (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-semibold">Announcements</h2>
                      <DialogCreateAnnouncement
                        courseId={parseInt(courseId as string)}
                        handleUpdate={UpdatePage}
                      />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 max-h-[300px]">
                      {announcements.length > 0 ? (
                        <div className="space-y-6 pb-4">
                          {announcements.map((announcement) => (
                            <div
                              key={announcement.ann_id}
                              className="border p-6 rounded-lg shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-xl">
                                  {announcement.ann_title}
                                </h3>
                                {staff_id &&
                                  announcement.staff_id === staff_id && (
                                    <div className="flex gap-2">
                                      <DialogEditAnnouncement
                                        annId={announcement.ann_id}
                                        initialTitle={announcement.ann_title}
                                        initialContent={
                                          announcement.ann_content
                                        }
                                        handleUpdate={UpdatePage}
                                      >
                                        <button className="text-blue-900 hover:text-blue-700 text-sm font-medium">
                                          Edit
                                        </button>
                                      </DialogEditAnnouncement>
                                      <button
                                        onClick={() =>
                                          handleDeleteAnnouncement(
                                            announcement.ann_id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                              </div>
                              <p className="mt-2 text-gray-700 whitespace-pre-wrap mb-6">
                                {announcement.ann_content}
                              </p>

                              {/* Author info */}
                              <div className="text-sm text-gray-600 border-t pt-2 pb-4">
                                <p className="font-medium">
                                  Posted by:{" "}
                                  {staff_id &&
                                  announcement.staff_id === staff_id
                                    ? "You"
                                    : `${announcement.staff_name} (${announcement.staff_email})`}
                                </p>
                              </div>

                              {/* Comments Section */}
                              <div className="mt-1">
                                <h4 className="font-semibold mb-4">
                                  Comments ({announcement.comments.length})
                                </h4>

                                {/* Existing Comments */}
                                {announcement.comments.length > 0 ? (
                                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                    {" "}
                                    {/* Scrollable comments if needed */}
                                    {announcement.comments.map((comment) => (
                                      <div
                                        key={comment.comment_id}
                                        className="border-l-4 border-blue-900 pl-4 py-2 bg-gray-50 rounded-r"
                                      >
                                        <p className="text-gray-800">
                                          {comment.comment_content}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {`${comment.stu_name} (${comment.stu_email})`}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-sm mb-6">
                                    No comments yet. Be the first to comment!
                                  </p>
                                )}

                                {/* Add Comment Form */}
                                {/* <div className="flex gap-3 mt-6">
                                  <Input
                                    placeholder="Write a comment..."
                                    value={
                                      commentInputs[announcement.ann_id] || ""
                                    }
                                    onChange={(e) =>
                                      handleCommentInputChange(
                                        announcement.ann_id,
                                        e.target.value
                                      )
                                    }
                                    className="flex-grow"
                                  />
                                  <Button
                                    onClick={() =>
                                      handleSubmitComment(announcement.ann_id)
                                    }
                                    disabled={
                                      !commentInputs[
                                        announcement.ann_id
                                      ]?.trim()
                                    }
                                  >
                                    Submit
                                  </Button>
                                </div> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-600 text-center">
                            No announcements available for this course
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "staff" && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Assigned Staff
                    </h2>
                    {course.assigned_staff.length > 0 ? (
                      <div className="flex gap-4">
                        {course.assigned_staff.map((staff) => (
                          <div
                            key={staff.staff_id}
                            className="border p-4 rounded-lg"
                          >
                            <h3 className="font-semibold">
                              {staff.staff_name}
                            </h3>
                            <p className="text-gray-600">{staff.staff_email}</p>
                            <p className="text-gray-600">
                              Role: {staff.staff_role}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No staff assigned to this course
                      </p>
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
