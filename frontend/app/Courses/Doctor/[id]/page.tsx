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
  CreateComment,
  deleteAnnouncement,
  getClassGrades,
  getQuestionaires,
} from "../actions";
import { Input } from "@/components/ui/input";
import { DialogCreateQuiz } from "./components/CreateQuiz";
import { StudentsClassworkTable } from "./components/StudentsClassworkTable";
import { StudentGradesTable } from "./components/StudentsGrades";
import { DialogCreateAnnouncement } from "./components/CreateAnnoucment";
import { getUserData } from "@/common/cookieHelpers";
import { DialogEditAnnouncement } from "./components/EditAnnouncement";
import { Button } from "@/components/ui/button";
import { DialogCreateQuestion } from "./components/CreateQuestionaire";
import { DialogSetQuizDueDate } from "./components/DialogSetQuizDueDate";
import { PageHeader } from "@/components/PageHeader";
interface Questionnaire {
  question_text?: string;
  form_url?: string;
  questionnaire_id: number;
  questions?: { question_text?: string }[];
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
  max_grade?: number;
  due_date?: string;
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
  course_code?: string;
  course_name: string;
  credit_hours: number;
  registered_students: number;
  max_registered_students: number;
  assigned_staff?: StaffMember[];
}

interface Announcement {
  staff_name: string;
  staff_email: string;
  ann_title: string;
  ann_content: string;
  comments: Comment[];
  staff_id: number;
  ann_id: number;
}

interface Comment {
  comment_id: number;
  comment_content: string;
  stu_name: string;
  stu_email: string;
}

const CoursePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");
  const [staff_id, setStaff_id] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
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
          console.error("Failed to fetch course:", response.error);
        }

        const announcementsResponse = await getAnnouncements(courseId);
        if (announcementsResponse.success) {
          setAnnouncements(announcementsResponse.announcements || []);
        }

        const quizzesResponse = await getQuizzes(courseId);
        setQuizzes(quizzesResponse.quizzes || []);

        const studentsResponse = await getRegisteredStudents(
          courseId
        );
        setStudents(studentsResponse.students || []);

        const gradesResponse = await getGrades(courseId);
        setGrades(gradesResponse.grades || []);

        const classworkResponse = await getClassGrades(
          courseId
        );
        if (classworkResponse.success && classworkResponse.students) {
          setClassworkGrades(classworkResponse.students || []);
        }

        const questionnairesResponse = await getQuestionaires(
          courseId
        );
        if (questionnairesResponse.success) {
          setQuestionnaires(questionnairesResponse.questionnaires || []);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (Number.isInteger(courseId)) {
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
      const response = await CreateComment(annId, commentText.trim());

      if (response.success) {
        setCommentInputs({
          ...commentInputs,
          [annId]: "",
        });
        await UpdatePage();
      } else {
        alert(response.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to post reply");
    }
  };

  const handleSetQuizDueDate = async () => {
  };

  const handleDeleteAnnouncement = async (annId: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        const response = await deleteAnnouncement(annId);
        if (response.success) {
          // Refresh announcements after successful deletion
          await UpdatePage();
        } else {
          console.error("Failed to delete announcement:", response.error);
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
        console.error("Failed to fetch course:", response.error);
      }

      const announcementsResponse = await getAnnouncements(courseId);
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.announcements || []);
      }

      const quizzesResponse = await getQuizzes(courseId);
      setQuizzes(quizzesResponse.quizzes || []);

      const studentsResponse = await getRegisteredStudents(
        courseId
      );
      setStudents(studentsResponse.students || []);

      const gradesResponse = await getGrades(courseId);
      setGrades(gradesResponse.grades || []);

      const classworkResponse = await getClassGrades(
        courseId
      );
      console.log(classworkResponse);
      if (classworkResponse.success && classworkResponse.students) {
        setClassworkGrades(classworkResponse.students || []);
      }

      const questionnairesResponse = await getQuestionaires(
        courseId
      );
      if (questionnairesResponse.success) {
        setQuestionnaires(questionnairesResponse.questionnaires || []);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeUpdate = async () => {
    const studentsResponse = await getRegisteredStudents(
      courseId
    );
    setStudents(studentsResponse.students || []);

    const gradesResponse = await getGrades(courseId);
    setGrades(gradesResponse.grades || []);

    const classworkResponse = await getClassGrades(courseId);
    if (classworkResponse.success) {
      setClassworkGrades(classworkResponse.students || []);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
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
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
              <div className="text-center text-red-600">Course not found</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const courseParts = course.course_name.split(": ");
  const courseCode = course.course_code || courseParts[0] || "";
  const courseTitle = courseParts[1] || course.course_name;
  const courseTabs = (
    <nav className="flex min-w-max gap-6 overflow-x-auto">
      {[
        ["quizzes", "Quizzes"],
        ["grades", "Quiz Grades"],
        ["studentsGrades", "Students & Classwork"],
        ["announcements", "Announcements"],
        ["questionnaires", "Questionnaires"],
        ["staff", "Staff"],
      ].map(([value, label]) => (
        <button
          key={value}
          onClick={() => setActiveTab(value)}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === value
              ? "border-blue-900 text-blue-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <ProtectedRoute allowedRoles={["TA", "Doctor"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title={courseTitle}
            description={`${courseCode} · ${course.credit_hours} Credit Hours`}
            breadcrumbs={[
              { label: "Assigned Courses", href: "/Courses/Doctor" },
              { label: courseTitle },
            ]}
            actions={
              <>
                <DialogCreateQuiz courseId={courseId} handleUpdate={UpdatePage} />
                <DialogCreateQuestion courseId={courseId} handleUpdate={UpdatePage} />
              </>
            }
            tabs={courseTabs}
          />
          <div className="mx-auto max-w-7xl">
            <div className="py-2 mb-6">
              <div>
                {activeTab === "questionnaires" && (
                  <div>
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
                              {questionnaire.form_url ? (
                                <a
                                  href={questionnaire.form_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-900 hover:underline"
                                >
                                  Open Questionnaire Form
                                </a>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  This questionnaire does not have a form link yet.
                                </p>
                              )}
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
                {activeTab === "quizzes" && (
                  <div>
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
                                googleFormUrl={quiz.google_form_url}
                                maxGrade={quiz.max_grade}
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

                {activeTab === "studentsGrades" && (
                  <div>
                    <StudentsClassworkTable
                      courseId={courseId.toString()}
                      students={students}
                      classworkGrades={classworkGrades}
                      quizzes={quizzes}
                      onGradeUpdate={handleGradeUpdate}
                    />
                  </div>
                )}

                {activeTab === "grades" && (
                  <div>
                    <StudentGradesTable grades={grades} courseId={courseId.toString()} />
                  </div>
                )}

                {activeTab === "announcements" && (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <DialogCreateAnnouncement
                        courseId={courseId}
                        handleUpdate={UpdatePage}
                      />
                    </div>

                    <div className="flex-1 pr-2">
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
                                  <div className="mb-6 space-y-4 pr-2">
                                    {announcement.comments
                                      .slice(0, expandedComments[announcement.ann_id] ? undefined : 3)
                                      .map((comment) => (
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
                                    {announcement.comments.length > 3 && !expandedComments[announcement.ann_id] && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedComments((current) => ({
                                            ...current,
                                            [announcement.ann_id]: true,
                                          }))
                                        }
                                        className="text-sm font-semibold text-blue-900 hover:underline"
                                      >
                                        Load more comments ({announcement.comments.length - 3})
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-sm mb-6">
                                    No comments yet. Be the first to comment!
                                  </p>
                                )}

                                {/* Reply form */}
                                <div className="flex gap-3 mt-6">
                                  <Input
                                    placeholder="Write a reply..."
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
                                    Reply
                                  </Button>
                                </div>
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
                    {(course.assigned_staff ?? []).length > 0 ? (
                      <div className="flex gap-4">
                        {(course.assigned_staff ?? []).map((staff) => (
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
