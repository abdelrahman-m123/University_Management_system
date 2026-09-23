"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl, toLegacyCourse } from "@/common/api";

async function headers() {
  return { Authorization: `Bearer ${await getAuthToken()}`, "Content-Type": "application/json" };
}

export async function getCalendarData() {
  try {
    const auth = await headers();
    const [years, semesters, courses, offerings] = await Promise.all([
      axios.get(apiUrl("/api/academic-years"), { headers: auth }),
      axios.get(apiUrl("/api/semesters"), { headers: auth }),
      axios.get(apiUrl("/api/courses"), { headers: auth }),
      axios.get(apiUrl("/api/offerings"), { headers: auth }),
    ]);
    return { success: true, years: years.data, semesters: semesters.data, courses: courses.data.map(toLegacyCourse), offerings: offerings.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function createAcademicYear(data: { name: string; startsAt: string; endsAt: string }) {
  try {
    const response = await axios.post(apiUrl("/api/academic-years"), data, { headers: await headers() });
    return { success: true, year: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function saveAcademicYear(id: number, data: { name: string; startsAt: string; endsAt: string }) {
  try {
    const response = await axios.put(apiUrl(`/api/academic-years/${id}`), data, { headers: await headers() });
    return { success: true, year: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function createSemester(academicYearId: number, data: Record<string, unknown>) {
  try {
    const response = await axios.post(apiUrl(`/api/academic-years/${academicYearId}/semesters`), data, { headers: await headers() });
    return { success: true, semester: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function saveSemester(id: number, data: Record<string, unknown>) {
  try {
    const response = await axios.put(apiUrl(`/api/semesters/${id}`), data, { headers: await headers() });
    return { success: true, semester: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function createOffering(data: { courseId: number; semesterId: number; capacity: number; isPublished: boolean }) {
  try {
    const response = await axios.post(apiUrl("/api/offerings"), data, { headers: await headers() });
    return { success: true, offering: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}

export async function updateOffering(id: number, data: { capacity: number; isPublished: boolean }) {
  try {
    const response = await axios.put(apiUrl(`/api/offerings/${id}`), data, { headers: await headers() });
    return { success: true, offering: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message ?? error.message };
  }
}
