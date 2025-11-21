"use server";

import axios from "axios";

export async function getAllApplications(search: string) {
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllRegistered",
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


export async function AcceptApplication(id: number, stu_id: number) {
  try {
    const resp = await axios.put(
      "http://localhost:3001/course_management/updateCourseRequest",
      {
       course_id: id,
       stu_id: stu_id,
       updated_status: "Accepted"
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

export async function RejectApplication(id: number, stu_id: number) {
  try {
    const resp = await axios.put(
      "http://localhost:3001/course_management/updateCourseRequest",
      {
       course_id: id,
       stu_id: stu_id,
       updated_status: "Rejected"
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