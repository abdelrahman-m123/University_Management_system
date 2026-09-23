import { getAuthToken } from "@/common/cookieHelpers";

export function apiUrl(path: string) {
  const baseUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5219";

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function authHeaders() {
  const token = await getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function toLegacyCourse(course: any) {
  const isOffering = course.offeringId !== undefined;
  return {
    ...course,
    course_id: isOffering ? course.offeringId : course.id,
    catalog_course_id: isOffering ? course.courseId : course.id,
    course_code: isOffering ? course.courseCode : course.code,
    course_name: isOffering ? course.courseName : course.name,
    credit_hours: isOffering ? course.creditHours : course.creditHours,
    max_registered_students: isOffering ? course.capacity : course.maxRegisteredStudents,
    semester_id: course.semesterId,
    semester_name: course.semesterName,
    academic_year_name: course.academicYearName,
    phase: course.phase,
    enrollment_count: course.enrollmentCount ?? course.enrolledCount,
    registered_students: course.enrollmentCount ?? course.enrolledCount,
  };
}

export function toLegacyStaff(staff: any) {
  return {
    ...staff,
    staff_id: staff.userId,
    staff_name: staff.fullName,
    staff_email: staff.email,
    phone: staff.phoneNumber,
    contact_info: staff.contactInfo,
    profile_link: staff.profileLink,
    office_location: staff.officeLocation,
    office_hours: staff.officeHours,
    role: staff.roles?.[0],
    courses: staff.courses ?? [],
  };
}

export function toLegacyEnrollment(enrollment: any) {
  const statusByValue: Record<number, string> = {
    1: "Pending",
    2: "Accepted",
    3: "Rejected",
    4: "Withdrawn",
    5: "Withdrawal Requested",
  };
  const status =
    typeof enrollment.status === "string"
      ? enrollment.status
      : statusByValue[Number(enrollment.status)] ?? "Pending";

  return {
    ...enrollment,
    course_id: enrollment.courseOfferingId ?? enrollment.courseId,
    catalog_course_id: enrollment.courseId,
    course_offering_id: enrollment.courseOfferingId ?? enrollment.courseId,
    semester_id: enrollment.semesterId,
    semester_name: enrollment.semesterName,
    semester_phase: enrollment.semesterPhase,
    can_request_withdrawal: enrollment.canRequestWithdrawal,
    course_code: enrollment.courseCode,
    course_name: enrollment.courseName,
    credit_hours: enrollment.creditHours,
    stu_id: enrollment.studentId,
    stu_name: enrollment.studentName,
    stu_email: enrollment.studentEmail,
    status,
    midterm_grade: enrollment.midtermGrade,
    classwork_grade: enrollment.classworkGrade,
    quizes_grade: enrollment.quizzesGrade,
    final_grade: enrollment.letterGrade ?? enrollment.finalGrade,
  };
}

export function toLegacyQuiz(quiz: any) {
  return {
    ...quiz,
    quiz_id: quiz.id,
    course_id: quiz.courseOfferingId ?? quiz.courseId,
    course_code: quiz.courseCode,
    quiz_title: quiz.title,
    google_form_url: quiz.googleFormUrl,
    max_grade: quiz.maxGrade,
    open_date: quiz.opensAt,
    close_date: quiz.closesAt,
    due_date: quiz.closesAt,
    created_at: quiz.createdAt,
    is_visible: quiz.isVisible,
  };
}

export function toLegacyQuizGrade(grade: any) {
  return {
    ...grade,
    quiz_id: grade.quizId,
    stu_id: grade.studentId,
    stu_name: grade.studentName,
    quiz_grade: grade.grade,
  };
}

export function toLegacyAnnouncement(announcement: any) {
  return {
    ...announcement,
    ann_id: announcement.id,
    course_id: announcement.courseOfferingId ?? announcement.courseId,
    staff_id: announcement.authorId,
    staff_name: announcement.authorName,
    staff_email: announcement.authorEmail,
    ann_title: announcement.title,
    ann_content: announcement.content,
    comments: announcement.comments?.map(toLegacyComment) ?? [],
  };
}

export function toLegacyComment(comment: any) {
  return {
    ...comment,
    comment_id: comment.id,
    user_id: comment.authorId,
    stu_id: comment.authorId,
    stu_name: comment.authorName,
    stu_email: comment.authorEmail,
    comment_content: comment.content,
  };
}

export function toLegacyQuestionnaire(questionnaire: any) {
  const questions =
    questionnaire.questions?.map((question: any) => ({
      ...question,
      question_id: question.id,
      question_text: question.text,
    })) ?? [];
  const formUrl = [
    questionnaire.googleFormUrl,
    questionnaire.formUrl,
    questionnaire.url,
    questions[0]?.question_text,
    questionnaire.questionText,
  ].find(
    (value) => typeof value === "string" && /^https?:\/\//i.test(value.trim()),
  )?.trim() ?? "";

  return {
    ...questionnaire,
    questionnaire_id: questionnaire.id,
    course_id: questionnaire.courseOfferingId ?? questionnaire.courseId,
    course_code: questionnaire.courseCode,
    question_text: questions[0]?.question_text ?? questionnaire.questionText ?? "",
    form_url: formUrl,
    questions,
  };
}
