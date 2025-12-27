"use server";

import { getAuthToken } from "@/common/cookieHelpers";
import axios from "axios";

export async function getStudentCourses(stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/MyCourses",
      {
        params: {
          stu_id: stu_id
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


export async function getCourse(staff_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/getCourse",
      {
        params: {
          course_id: staff_id
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

export async function getCalendar() {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/quizzes/myCalender",
      {

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


export async function getQuizzes(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      `http://localhost:3001/course_management/quizzes/getCourseQuiz/${course_id}`,
      {
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


export async function getAnnouncements(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(`http://localhost:3001/announcemnts/getCourseAnnouncement/${course_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

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


export async function EditComment( ann_id: number,commentId: number,  Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      `http://localhost:3001/announcemnts/editComment/${ann_id}/${commentId}`,
      {
        content: Content
      },
      {
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



export async function CreateComment( ann_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/announcemnts/addComment/${ann_id}`,
      {
        content: Content
      },
      {
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


export async function deleteComment(ann_id: number, comment_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.delete(`http://localhost:3001/announcemnts/removeComment/${ann_id}/${comment_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

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

export async function getClassGrades(course_id: number, stu_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(`http://localhost:3001/course_management/getClassWorkGrades/${course_id}/${stu_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    });

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


export async function getQuestionaires(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      `http://localhost:3001/questionnaire/getCourseQuestionnaire/${course_id}`,
      {
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