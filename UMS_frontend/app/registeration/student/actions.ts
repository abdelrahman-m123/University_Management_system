"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";

export async function getAllCourses(
  search: string, 
  stu_id?: number, 
  page: number = 1, 
  limit: number = 5
) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllOffered",
      {
        params: {
          search: search || "",
          stu_id: stu_id || "",
          page: page || 1,
          limit: limit || 5
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
    const authToken = await getAuthToken();
    const resp = await axios.post(
      "http://localhost:3001/course_management/registerCourse",
      {
        course_id: id,
        stu_id: token
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
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
