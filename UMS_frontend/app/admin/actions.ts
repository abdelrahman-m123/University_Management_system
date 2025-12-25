"use server"

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";

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
      "http://localhost:3001/api/auth/getAllStaff",
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
    console.log(resp.data);
    return resp.data;
  } catch (error) {
    return { success: false, staff: [] };
  }
}

export async function updateStaffRole(staffId: string, newRole: string) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`http://localhost:3001/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to update role" };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`http://localhost:3001/api/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
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
    
    const response = await axios.post("http://localhost:3001/api/auth/addUser", {
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
}) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      "http://localhost:3001/api/auth/editStaff",
      staffData,
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

export async function assignCourse({ staff_id, course_id }: { staff_id: number; course_id: number }) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      "http://localhost:3001/course_management/assignCourse",
      {
        staff_id,
        course_id
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

export async function getAllCourses(search: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllCourses",
      {
        params: {
          search: search
        },
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