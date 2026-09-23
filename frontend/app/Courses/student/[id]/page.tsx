"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoutes";
import Sidebar from "../../../../components/sidebar";
import {
  getCourse,
  getQuizzes,
  getAnnouncements,
  CreateComment,
  deleteComment,
  getClassGrades,
  getQuestionaires,
} from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/common/cookieHelpers";
import { DialogEditComment } from "./components/EditComment";
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

interface Quiz {
  quiz_id: number;
  quiz_title: string;
  google_form_url: string;
}

interface Comment {
  comment_id: number;
  comment_content: string;
  stu_id: number;
  stu_name: string;
  stu_email: string;
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
interface ClassworkGrades {
  midterm_grade?: number | null;
  classwork_grade?: number | null;
  quizes_grade?: number | null;
  final_grade?: string;
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

const CoursePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");
  const [studentId, setStudentId] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [classworkGrades, setClassworkGrades] =
    useState<ClassworkGrades | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await getCourse(courseId);
        const userData = await getUserData();

        setStudentId(userData.userId);

        if (response.success && response.course) {
          setCourse(response.course);
        } else {
          console.error("Failed to fetch course:", response.error);
        }

        const quizzesResponse = await getQuizzes(courseId);
        setQuizzes(quizzesResponse.quizzes || []);

        const announcementsResponse = await getAnnouncements(courseId);
        if (announcementsResponse.success) {
          setAnnouncements(announcementsResponse.announcements || []);
        }

        if (userData.userId) {
          const gradesResponse = await getClassGrades(
            courseId,
            userData.userId
          );
          if (gradesResponse.success && gradesResponse.grades) {
            setClassworkGrades(gradesResponse.grades);
          }
        }

        // Fetch questionnaires
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
      const response = await CreateComment(annId, commentText);

      if (response.success) {
        setCommentInputs({
          ...commentInputs,
          [annId]: "",
        });

        await UpdatePage();
      } else {
        alert(response.error || "Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("An error occurred while submitting the comment");
    }
  };

  const UpdatePage = async () => {
    try {
      const announcementsResponse = await getAnnouncements(courseId);
      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.announcements || []);
      }

      if (studentId) {
        const gradesResponse = await getClassGrades(
          courseId,
          studentId
        );
        if (gradesResponse.success && gradesResponse.grades) {
          setClassworkGrades(gradesResponse.grades);
        }
      }

      // Refresh questionnaires
      const questionnairesResponse = await getQuestionaires(
        courseId
      );
      if (questionnairesResponse.success) {
        setQuestionnaires(questionnairesResponse.questionnaires || []);
      }
    } catch (error) {
      console.error("Error refreshing announcements:", error);
    }
  };

  const handleDeleteComment = async (annId: number, commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await deleteComment(annId, commentId);

        if (response.success) {
          // Refresh announcements after successful deletion
          await UpdatePage();
        } else {
          alert(response.error || "Failed to delete comment");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("An error occurred while deleting the comment");
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["student"]}>
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
      <ProtectedRoute allowedRoles={["student"]}>
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
        onClick={() => setActiveTab("classwork")}
        className={`py-2 px-1 border-b-2 font-medium text-sm ${
          activeTab === "classwork"
            ? "border-blue-900 text-blue-900"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        My Grades
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
  );

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title={courseTitle}
            description={`${courseCode} · ${course.credit_hours} Credit Hours`}
            breadcrumbs={[
              { label: "Registered Courses", href: "/Courses/student" },
              { label: courseTitle },
            ]}
            tabs={courseTabs}
          />
          <div className="mx-auto max-w-7xl">
            <div className="py-2 mb-6">
              {/* Tab Content */}
              <div>
                {activeTab === "questionnaires" && (
                  <div>
                    {questionnaires.length > 0 ? (
                      <div className="space-y-4">
                        {questionnaires.map((questionnaire, index) => {
                          return (
                            <div
                              key={questionnaire.questionnaire_id}
                              className="border p-4 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <h3 className="font-semibold mb-2 text-blue-900">
                                Questionnaire {index + 1}
                              </h3>
                                <div>
                                  <p className="text-gray-600 text-sm mb-2">
                                    Please complete this questionnaire to
                                    provide feedback about the course.
                                  </p>
                                  {questionnaire.form_url ? (
                                    <a
                                      href={questionnaire.form_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-white transition-colors hover:bg-blue-800"
                                    >
                                      Open & Complete Questionnaire
                                    </a>
                                  ) : (
                                    <p className="text-sm text-slate-500">
                                      This questionnaire does not have a form link yet.
                                    </p>
                                  )}
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">
                          No questionnaires available for this course yet
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Questionnaires will appear here when your instructor
                          creates them.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "classwork" && (
                  <div>
                    {classworkGrades ? (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Midterm Grade Card */}
                          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Midterm Grade
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              {classworkGrades.midterm_grade != null
                                ? `${classworkGrades.midterm_grade}%`
                                : "-"}
                            </div>
                          </div>

                          {/* Classwork Grade Card */}
                          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Classwork Grade
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              {classworkGrades.classwork_grade != null
                                ? `${classworkGrades.classwork_grade}%`
                                : "-"}
                            </div>
                          </div>

                          {/* Quizzes Grade Card */}
                          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">
                              Quizzes Grade
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              {classworkGrades.quizes_grade != null
                                ? `${classworkGrades.quizes_grade}%`
                                : "-"}
                            </div>
                          </div>
                        </div>

                        {/* Grade Summary */}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-gray-600 mb-4">
                          Your grades for this course are not available yet.
                        </div>
                        <p className="text-sm text-gray-500">
                          Grades will appear here once they are submitted by
                          your instructor.
                        </p>
                      </div>
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
                      <p className="text-gray-600">
                        No quizzes available for this course
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "announcements" && (
                  <div className="h-full flex flex-col">
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
                              </div>
                              <p className="mt-2 text-gray-700 whitespace-pre-wrap mb-6">
                                {announcement.ann_content}
                              </p>

                              {/* Author info */}
                              <div className="text-sm text-gray-600 border-t pt-2 pb-4">
                                <p className="font-medium">
                                  Posted by: {announcement.staff_name} (
                                  {announcement.staff_email})
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
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <p className="text-gray-800">
                                              {comment.comment_content}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                              {studentId &&
                                              comment.stu_id === studentId
                                                ? "You"
                                                : `${comment.stu_name} (${comment.stu_email})`}
                                            </p>
                                          </div>
                                          {studentId &&
                                            comment.stu_id === studentId && (
                                              <div className="flex gap-2">
                                                <DialogEditComment
                                                  annId={announcement.ann_id}
                                                  commentId={comment.comment_id}
                                                  initialContent={
                                                    comment.comment_content
                                                  }
                                                  handleUpdate={UpdatePage}
                                                >
                                                  <button className="text-blue-900 hover:text-blue-700 text-sm font-medium">
                                                    Edit
                                                  </button>
                                                </DialogEditComment>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteComment(
                                                      announcement.ann_id,
                                                      comment.comment_id
                                                    )
                                                  }
                                                  className="text-red-600 hover:text-red-800 text-sm font-medium mr-3"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            )}
                                        </div>
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

                                {/* Add Comment Form */}
                                <div className="flex gap-3 mt-6">
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
