"use server";

import axios from "axios";

export async function getStaffCourses(staff_id: number) {
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/assignedCourse",
      {
        params: {
          staff_id: staff_id
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
    const resp = await axios.get(
      "http://localhost:3001/course_management/getCourse",
      {
        params: {
          course_id: staff_id
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
    const resp = await axios.post(
      "http://localhost:3001/course_management/quizzes/addQuiz",
      {
        quiz_title: quizTitle,
        course_id: course_id,
        google_form_url: url
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
    const resp = await axios.get(
      `http://localhost:3001/course_management/quizzes/getCourseQuiz/${course_id}`
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
    const resp = await axios.get(
      `http://localhost:3001/course_management/getAllRegisteredStudents`,
      {
        params: {
          status: "Accepted",
          course_id: course_id
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
    const resp = await axios.post(
      `http://localhost:3001/course_management/quizzes/gradeQuiz`,
      {
        quiz_id: quiz_id,
        stu_id: stu_id,
        quiz_grade: grade
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
    const resp = await axios.get(`http://localhost:3001/course_management/quizzes/getQuizGrades/${course_id}`);

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
