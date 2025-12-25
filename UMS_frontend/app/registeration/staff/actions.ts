"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";

export async function getAllApplications(
  search: string, 
  page: number = 1, 
  limit: number = 5
) {
  try {
    const token = await getAuthToken();
    console.log(search);
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllRegistered",
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

export async function AcceptApplication(id: number, stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      "http://localhost:3001/course_management/updateCourseRequest",
      {
       course_id: id,
       stu_id: stu_id,
       updated_status: "Accepted"
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

export async function RejectApplication(id: number, stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      "http://localhost:3001/course_management/updateCourseRequest",
      {
       course_id: id,
       stu_id: stu_id,
       updated_status: "Rejected"
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