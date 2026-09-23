"use server"

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl, toLegacyCourse, toLegacyStaff } from "@/common/api";

export async function getAllStaff(
  search: string = "", 
  role: string = "", 
  page: number = 1, 
  limit: number = 5
) {
  try {
    const token = await getAuthToken();
    console.log("params: ", {search, role, page, limit})
    const resp = await axios.get(
      apiUrl("/api/staff"),
      {
        params: {
          search: search,
          role: role,
          page: page,
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const filteredStaff = resp.data
      .map(toLegacyStaff)
      .filter((member: any) =>
        (!search || member.staff_name?.toLowerCase().includes(search.toLowerCase()) || member.staff_email?.toLowerCase().includes(search.toLowerCase())) &&
        (!role || member.roles?.includes(role))
      );
    const start = Math.max(0, (page - 1) * limit);
    const staff = filteredStaff.slice(start, start + limit);
    return {
      success: true,
      staff,
      total: filteredStaff.length,
      totalCount: filteredStaff.length,
    };
  } catch (error) {
    return { success: false, staff: [] };
  }
}

export async function updateStaffRole(staffId: string, newRole: string) {
  try {
    const token = await getAuthToken();
    const response = await fetch(apiUrl(`/api/staff/${staffId}`), {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fullName: "", specialization: newRole })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to update role" };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const token = await getAuthToken();
    return { success: false, message: "Delete staff is not migrated to the ASP.NET API yet." };
  } catch (error) {
    return { success: false, message: "Failed to delete staff" };
  }
}

export async function addStaff(staffData: any) {
  try {
    const token = await getAuthToken();
    const {username, email, password, role} = staffData;
    console.log(username);
    console.log(staffData);
    
    const response = await axios.post(apiUrl("/api/auth/addUser"), {
      users: [
        {
            username: username,
            email: email,
            password: password,
            role: role,
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.data;
  } catch (error) {
    return { success: false, message: "Failed to add staff" };
  }
}

export async function editStaff(staffData: {
  staff_id: number;
  staff_name: string;
  role: string;
  phone?: string;
  contact_info?: string;
  profile_link?: string;
  office_hours?: string;
  rating?: number;
  numberOfResearchPapers?: number;
  specialization?: string;
  remoteWork?: boolean;
}) {
  try {
    console.log("Staff data: \n\n",staffData);
    const token = await getAuthToken();
    const resp = await axios.put(
      apiUrl(`/api/staff/${staffData.staff_id}`),
      {
        fullName: staffData.staff_name,
        phoneNumber: staffData.phone,
        contactInfo: staffData.contact_info,
        profileLink: staffData.profile_link,
        officeHours: staffData.office_hours || null,
        specialization: staffData.specialization,
        rating: staffData.rating,
        numberOfResearchPapers: staffData.numberOfResearchPapers,
        remoteWork: staffData.remoteWork ?? false,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, staff: toLegacyStaff(resp.data) };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function assignCourse({ staff_id, course_id }: { staff_id: number; course_id: number }) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      apiUrl("/api/staff-courses"),
      {
        staffId: staff_id,
        courseOfferingId: course_id
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(resp);
    return { success: true, assignment: resp.data };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function getAllCourses(search: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(apiUrl("/api/offerings"), {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const courses = resp.data
      .map(toLegacyCourse)
      .filter((course: any) => !search || course.course_name?.toLowerCase().includes(search.toLowerCase()));
    return { success: true, courses, total: courses.length };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}

export async function getStaffById(id: number) {
  try {
    const token = await getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const [resp, coursesResp] = await Promise.all([
      axios.get(apiUrl(`/api/staff/${id}`), { headers }),
      axios.get(apiUrl(`/api/staff-courses/staff/${id}`), { headers }),
    ]);
    const staff = toLegacyStaff(resp.data);
    staff.courses = (coursesResp.data ?? []).map((course: any) => ({
      ...course,
      course_id: course.courseOfferingId,
      course_code: course.courseCode,
      course_name: course.courseName,
      credit_hours: course.creditHours,
      semester_name: course.semesterName,
    }));
    return { success: true, staff };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message;
    return { success: false, error: message };
  }
}
