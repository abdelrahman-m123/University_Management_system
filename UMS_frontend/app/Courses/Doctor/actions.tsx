"use server";

import { getAuthToken } from "@/common/cookieHelpers";
import axios from "axios";

export async function getStaffCourses(staff_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/assignedCourse",
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

    return resp.data;
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
      "http://localhost:3001/course_management/getCourse",
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

    console.log(resp.data);

    return resp.data;
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
      "http://localhost:3001/course_management/quizzes/addQuiz",
      {
        quiz_title: quizTitle,
        course_id: course_id,
        google_form_url: url
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return resp.data;
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
      `http://localhost:3001/course_management/quizzes/getCourseQuiz/${course_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return resp.data;
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
      `http://localhost:3001/course_management/getAllRegisteredStudents`,
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

    return resp.data;
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
      `http://localhost:3001/course_management/quizzes/gradeQuiz`,
      {
        quiz_id: quiz_id,
        stu_id: stu_id,
        quiz_grade: grade
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp.data);

    return resp.data;
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
    const resp = await axios.get(`http://localhost:3001/course_management/quizzes/getQuizGrades/${course_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

    console.log(resp.data);

    return resp.data;
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}
