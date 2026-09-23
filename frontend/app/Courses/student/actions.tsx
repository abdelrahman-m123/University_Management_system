"use server";

import { getAuthToken, getUserData } from "@/common/cookieHelpers";
import {
  apiUrl,
  toLegacyAnnouncement,
  toLegacyCourse,
  toLegacyEnrollment,
  toLegacyQuestionnaire,
  toLegacyQuiz,
} from "@/common/api";
import axios from "axios";

export async function getStudentCourses(stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl(`/api/enrollments/students/${stu_id}`),
      {
        params: {
          stu_id: stu_id
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp);

    const courses = resp.data.map(toLegacyEnrollment);
    return { success: true, courses };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function getCourse(staff_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl(`/api/offerings/${staff_id}`),
      {
        params: {
          course_id: staff_id
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const staffResponse = await axios.get(
      apiUrl(`/api/staff-courses/offerings/${staff_id}`),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const course = toLegacyCourse(resp.data);
    course.assigned_staff = staffResponse.data.map((assignment: any) => ({
      staff_id: assignment.staffId,
      staff_name: assignment.staffName,
      staff_email: assignment.staffEmail,
      staff_role: assignment.assignmentRole || "Staff",
    }));

    return { success: true, course };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function getCalendar() {
  try {
    const userData = await getUserData();
    const studentId = Number(userData?.userId);
    if (!Number.isInteger(studentId)) {
      return { success: false, result: [], error: "Student session not found" };
    }

    const coursesResponse = await getStudentCourses(studentId);
    if (!coursesResponse.success) {
      return { success: false, result: [], error: coursesResponse.error };
    }

    const token = await getAuthToken();
    const quizResponses = await Promise.all(
      coursesResponse.courses.map((course: any) =>
        axios.get(apiUrl(`/api/quizzes/offerings/${course.course_id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).then((response) =>
          response.data.map((quiz: any) => ({
            ...toLegacyQuiz(quiz),
            course_name: course.course_name,
          }))
        )
      )
    );

    return { success: true, result: quizResponses.flat() };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, result: [], error: message };
  }
}


export async function getQuizzes(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl(`/api/quizzes/offerings/${course_id}`),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, quizzes: resp.data.map(toLegacyQuiz) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function getAnnouncements(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(apiUrl(`/api/announcements/offerings/${course_id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    console.log(resp.data);

    return { success: true, announcements: resp.data.map(toLegacyAnnouncement) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function EditComment( ann_id: number,commentId: number,  Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/announcements/comments/${commentId}`),
      { content: Content },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return { success: true, comment: resp.data };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}



export async function CreateComment( ann_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    const resp = await axios.post(
      apiUrl(`/api/announcements/${ann_id}/comments`),
      {
        authorId: userData?.userId,
        content: Content
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, comment: resp.data };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function deleteComment(ann_id: number, comment_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.delete(apiUrl(`/api/announcements/comments/${comment_id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    console.log(resp.data);

    return { success: resp.status === 204 };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function getClassGrades(course_id: number, stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(apiUrl(`/api/enrollments/students/${stu_id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    console.log(resp.data);

    const enrollment = resp.data.map(toLegacyEnrollment).find((item: any) => item.course_id === course_id);
    return { success: true, grades: enrollment ?? null };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function getQuestionaires(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl(`/api/questionnaires/offerings/${course_id}`),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, questionnaires: resp.data.map(toLegacyQuestionnaire) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function requestCourseWithdrawal(offeringId: number, studentId: number) {
  try {
    const token = await getAuthToken();
    const response = await axios.post(apiUrl(`/api/enrollments/${offeringId}/students/${studentId}/withdraw`), {}, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return { success: true, enrollment: toLegacyEnrollment(response.data) };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}
