"use server";

import axios from "axios";

export async function getAllCourses(search: string, stu_id?: number) {
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllOffered",
      {
        params: {
          search: search || "",
          stu_id: stu_id || ""
        }
      }
    );
    console.log(resp.data)

    return resp.data;
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}



export async function registerCourse(id: number, token: number) {
  try {
    const resp = await axios.post(
      "http://localhost:3001/course_management/registerCourse",
      {
        course_id: id,
        stu_id: token
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


export async function removeCourse(id: number) {
  try {
    const resp = await axios.post(
      "http://localhost:3001/course_management/removeCourse",
      {
       course_id: id
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
