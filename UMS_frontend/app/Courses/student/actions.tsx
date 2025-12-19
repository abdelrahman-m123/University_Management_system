"use server";

import axios from "axios";

export async function getStudentCourses(stu_id: number) {
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/MyCourses",
      {
        params: {
          stu_id: stu_id
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
