// In your actions file
"use server"

import axios from "axios";

export async function getAllStaff(search: string = "", role: string = "") {
  try {
    const resp = await axios.get(
      "http://localhost:3001/api/auth/getAllStaff",
      {
        params: {
          search: search,
          role: role
        }
      }
    );
    console.log(resp);
    return await resp.data;
  } catch (error) {
    return { success: false, staff: [] };
  }
}

export async function updateStaffRole(staffId: string, newRole: string) {
  try {
    const response = await fetch(`/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to update role" };
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const response = await fetch(`/api/staff/${staffId}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Failed to delete staff" };
  }
}

// In your actions file
export async function addStaff(staffData) {
  try {
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
    const resp = await axios.put(
      "http://localhost:3001/api/auth/editStaff",
      staffData
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
    const resp = await axios.post(
      "http://localhost:3001/course_management/assignCourse",
      {
        staff_id,
        course_id
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
    const resp = await axios.get(
      "http://localhost:3001/course_management/getAllCourses",
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