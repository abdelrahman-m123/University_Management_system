"use server";

import axios from "axios";

export async function getAllCourses(search: string) {
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllCourses",
      {
        params: {
          search: search
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


export async function addCourse(name: string, hours: number) {
  try {
    const resp = await axios.post(
      "http://localhost:3001/course_management/addCourse",
      {
       course_name: name,
       credit_hours: hours,
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
