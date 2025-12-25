"use server";

import { getAuthToken } from "@/common/cookieHelpers";
import axios from "axios";

export async function getAllCourses(
  search: string, 
  page: number = 1, 
  limit: number = 10
) {


  const token = await getAuthToken();
  console.log("auth token from server actions:", token);
  try {
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllCourses", // Adjust the endpoint if needed
      {
        params: {
          search: search || "",
          page: page,
          limit: limit
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


export async function addCourse(name: string, hours: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      "http://localhost:3001/course_management/addCourse",
      {
       course_name: name,
       credit_hours: hours,
      },
      {
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


export async function removeCourse(id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      "http://localhost:3001/course_management/removeCourse",
      {
       course_id: id
      },
      {
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
