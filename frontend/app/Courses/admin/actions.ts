"use server";

import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl, toLegacyCourse } from "@/common/api";
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
      apiUrl("/api/courses"),
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

    const filteredCourses = resp.data
      .map(toLegacyCourse)
      .filter((course: any) =>
        !search || course.course_name?.toLowerCase().includes(search.toLowerCase())
      );
    const start = Math.max(0, (page - 1) * limit);
    const courses = filteredCourses.slice(start, start + limit);
    return {
      success: true,
      courses,
      total: filteredCourses.length,
      totalCount: filteredCourses.length,
    };
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


export async function removeCourse(id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.delete(
      apiUrl(`/api/courses/${id}`),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(resp);

    return { success: resp.status === 204 };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;

    return { success: false, error: message };
  }
}
