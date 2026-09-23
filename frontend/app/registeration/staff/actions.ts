"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl, toLegacyCourse, toLegacyEnrollment } from "@/common/api";

export async function getAllApplications(
  search: string, 
  page: number = 1, 
  limit: number = 5,
  semesterId?: number
) {
  try {
    const token = await getAuthToken();
    console.log(search);
    const resp = await axios.get(
      apiUrl("/api/enrollments"),
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
    const filteredApplications = resp.data
      .map(toLegacyEnrollment)
      .filter((application: any) =>
        (!semesterId || application.semester_id === semesterId) && (!search ||
        application.course_name?.toLowerCase().includes(search.toLowerCase()) ||
        application.stu_name?.toLowerCase().includes(search.toLowerCase()))
      );
    const start = Math.max(0, (page - 1) * limit);
    const applications = filteredApplications.slice(start, start + limit);
    return { success: true, applications, total: filteredApplications.length };
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
      apiUrl("/api/courses"),
      {
       code: name.replace(/\s+/g, "-").toUpperCase(),
       name,
       creditHours: hours,
       maxRegisteredStudents: 200,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, course: toLegacyCourse(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function getApplicationSemesters() {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(apiUrl("/api/semesters"), { headers: { Authorization: `Bearer ${token}` } });
    return { success: true, semesters: resp.data };
  } catch (err: any) {
    return { success: false, semesters: [], error: err.response?.data?.message ?? err.message };
  }
}

export async function AcceptApplication(id: number, stu_id: number, status = "Accepted") {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/enrollments/${id}/students/${stu_id}`),
      {
       status
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, application: toLegacyEnrollment(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function RejectApplication(id: number, stu_id: number, status = "Rejected") {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/enrollments/${id}/students/${stu_id}`),
      {
       status
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, application: toLegacyEnrollment(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}
