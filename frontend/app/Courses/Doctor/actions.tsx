"use server";

import { getAuthToken, getUserData } from "@/common/cookieHelpers";
import {
  apiUrl,
  toLegacyAnnouncement,
  toLegacyCourse,
  toLegacyEnrollment,
  toLegacyQuestionnaire,
  toLegacyQuiz,
  toLegacyQuizGrade,
} from "@/common/api";
import axios from "axios";

const gradeToNumber: Record<string, number> = {
  A: 10,
  B: 8,
  C: 6,
  D: 4,
  F: 0,
};

export async function getStaffCourses(staff_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl(`/api/staff-courses/staff/${staff_id}`),
      {
        params: {
          staff_id: staff_id
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      
      }
    );

    console.log(resp);

    const courses = resp.data.map((assignment: any) => ({
      ...assignment,
      ...toLegacyCourse({
          offeringId: assignment.courseOfferingId,
          courseId: assignment.courseId,
          courseCode: assignment.courseCode,
          courseName: assignment.courseName,
          creditHours: assignment.creditHours,
          semesterId: assignment.semesterId,
          semesterName: assignment.semesterName,
      }),
    }));
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

    const staffResp = await axios.get(
      apiUrl(`/api/staff-courses/offerings/${staff_id}`),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const course = {
      ...toLegacyCourse(resp.data),
      assigned_staff: staffResp.data.map((assignment: any) => ({
        staff_id: assignment.staffId,
        staff_name: assignment.staffName,
        staff_email: assignment.staffEmail,
        staff_role: assignment.assignmentRole || "Staff",
      })),
    };

    return { success: true, course };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}


export async function CreateQuiz(quizTitle: string, course_id: number, url: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      apiUrl("/api/quizzes"),
      {
        title: quizTitle,
        courseOfferingId: course_id,
        googleFormUrl: url,
        maxGrade: 10,
        isVisible: false
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, quiz: toLegacyQuiz(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function publishQuiz(
  quiz_id: string,
  open_date: string,
  close_date: string,
  title: string,
  googleFormUrl: string | null,
  maxGrade: number = 10
) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/quizzes/${quiz_id}`),
      {
        title,
        googleFormUrl,
        maxGrade,
        opensAt: open_date,
        closesAt: close_date,
        isVisible: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, quiz: toLegacyQuiz(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}
export async function CreateQuestion(quizTitle: string, course_id: number, url: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      apiUrl("/api/questionnaires"),
      {
        courseOfferingId: course_id,
        questions: [{ text: url, isRequired: true }],
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, questionnaire: toLegacyQuestionnaire(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function CreateAnnouncement(Title: string, course_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    const resp = await axios.post(
      apiUrl("/api/announcements"),
      {
        courseOfferingId: course_id,
        authorId: userData?.userId,
        title: Title,
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

    return { success: true, announcement: toLegacyAnnouncement(resp.data) };
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

export async function EditAnnouncement(Title: string, ann_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/announcements/${ann_id}`),
      {
        title: Title,
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

    return { success: true, announcement: toLegacyAnnouncement(resp.data) };
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


export async function getRegisteredStudents(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      apiUrl("/api/enrollments"),
      {
        params: {
          status: "Accepted",
          course_id: course_id
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    const students = resp.data
      .map(toLegacyEnrollment)
      .filter((enrollment: any) => enrollment.status === "Accepted" && enrollment.course_id === course_id);
    return { success: true, students };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function gradeQuiz(quiz_id: number, stu_id: string, grade: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      apiUrl(`/api/quizzes/${quiz_id}/grades`),
      {
        studentId: parseInt(stu_id, 10),
        grade: gradeToNumber[grade] ?? parseInt(grade, 10) ?? 0
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return { success: true, grade: toLegacyQuizGrade(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function gradeCoursework(
  studentId: number, 
  courseId: number, 
  midtermGrade: number,
  classworkGrade: number,
  quizzesGrade: number
  ) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/enrollments/${courseId}/students/${studentId}`),
      {
        status: "Accepted",
        midtermGrade,
        classworkGrade,
        quizzesGrade,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, enrollment: toLegacyEnrollment(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function getGrades(course_id: number) {
  try {
    const token = await getAuthToken();
    const quizzes = await axios.get(apiUrl(`/api/quizzes/offerings/${course_id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    const gradeResponses = await Promise.all(
      quizzes.data.map((quiz: any) =>
        axios.get(apiUrl(`/api/quizzes/${quiz.id}/grades`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      )
    );

    const grades = gradeResponses.flatMap((response) => response.data.map(toLegacyQuizGrade));
    return { success: true, grades };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}

export async function getClassGrades(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(apiUrl("/api/enrollments"), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    console.log(resp.data);

    const students = resp.data
      .map(toLegacyEnrollment)
      .filter((enrollment: any) => enrollment.course_id === course_id);
    return {
      success: true,
      students: students.map((enrollment: any) => ({
        ...enrollment,
        grades: {
          midterm_grade: enrollment.midterm_grade,
          classwork_grade: enrollment.classwork_grade,
          quizes_grade: enrollment.quizes_grade,
          final_grade: enrollment.final_grade,
        },
      })),
    };
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

export async function deleteAnnouncement(ann_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.delete(apiUrl(`/api/announcements/${ann_id}`), {
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
