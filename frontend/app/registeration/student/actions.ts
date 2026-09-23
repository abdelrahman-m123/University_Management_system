"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl, toLegacyCourse, toLegacyEnrollment } from "@/common/api";

export async function getAllCourses(
  search: string, 
  stu_id?: number, 
  page: number = 1, 
  limit: number = 5,
  semesterId?: number
) {
  try {
    const token = await getAuthToken();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const semesterResponse = await axios.get(apiUrl("/api/semesters"), { headers });
    const semesters = semesterResponse.data as any[];
    const selectedSemester = semesters.find((semester) => semester.id === semesterId) ??
      semesters.find((semester) => semester.phase === "Registration Open") ?? semesters[0];
    if (!selectedSemester) return { success: true, courses: [], total: 0, totalCount: 0, semesters: [] };
    const resp = await axios.get(apiUrl(`/api/semesters/${selectedSemester.id}/offerings`), { headers });
    const enrollments = stu_id
      ? await axios.get(apiUrl(`/api/enrollments/students/${stu_id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      : null;

    const statusByCourse = new Map<number, string>();
    (enrollments?.data ?? []).forEach((enrollment: any) => {
      const legacyEnrollment = toLegacyEnrollment(enrollment);
      statusByCourse.set(legacyEnrollment.course_offering_id, legacyEnrollment.status);
    });

    const allCourses = resp.data.map(toLegacyCourse)
      .filter((course: any) => !search || course.course_name?.toLowerCase().includes(search.toLowerCase()))
      .map((course: any) => ({
        ...course,
        status: statusByCourse.get(course.course_id) ?? null,
      }));
    const start = Math.max(0, (page - 1) * limit);
    const courses = allCourses.slice(start, start + limit);
    return {
      success: true,
      courses,
      total: allCourses.length,
      totalCount: allCourses.length,
      semester: selectedSemester,
      semesters,
    };
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
      apiUrl("/api/enrollments"),
      {
        courseOfferingId: id,
        studentId: token
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, enrollment: toLegacyEnrollment(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function joinCourseWaitlist(id: number, studentId: number) {
  try {
    const authToken = await getAuthToken();
    const resp = await axios.post(apiUrl("/api/enrollments/waitlist"), { courseOfferingId: id, studentId }, { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } });
    return { success: true, enrollment: toLegacyEnrollment(resp.data) };
  } catch (err: any) {
    return { success: false, error: axios.isAxiosError(err) ? err.response?.data : err.message };
  }
}

export async function leaveCourseWaitlist(id: number, studentId: number) {
  try {
    const authToken = await getAuthToken();
    await axios.delete(apiUrl(`/api/enrollments/${id}/students/${studentId}/waitlist`), { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: axios.isAxiosError(err) ? err.response?.data : err.message };
  }
}

export async function getRealtimeToken() {
  return getAuthToken();
}
