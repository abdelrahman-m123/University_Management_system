"use server";

import { getAuthToken } from "@/common/cookieHelpers";
import axios from "axios";

export async function getStaffCourses(staff_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      "http://localhost:3001/course_management/assignedCourse",
      {
        params: {
          staff_id: staff_id
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


export async function CreateQuiz(quizTitle: string, course_id: number, url: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      "http://localhost:3001/course_management/quizzes/addQuiz",
      {
        quiz_title: quizTitle,
        course_id: course_id,
        google_form_url: url
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

export async function publishQuiz(quiz_id: string, open_date: number, close_date: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/course_management/quizzes/publishQuiz/${quiz_id}`,
      {
        open_date,
        close_date,
        is_visible: true
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
export async function CreateQuestion(quizTitle: string, course_id: number, url: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/questionnaire/addQuestion/${course_id}`,
      {
        question_text: url,
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

export async function CreateAnnouncement(Title: string, course_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/announcemnts/createAnnouncement/${course_id}`,
      {
        title: Title,
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

export async function EditAnnouncement(Title: string, ann_id: number, Content: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.put(
      `http://localhost:3001/announcemnts/editAnnouncement/${ann_id}`,
      {
        title: Title,
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


export async function getRegisteredStudents(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(
      `http://localhost:3001/course_management/getAllRegisteredStudents`,
      {
        params: {
          status: "Accepted",
          course_id: course_id
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

export async function gradeQuiz(quiz_id: number, stu_id: string, grade: string) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/course_management/quizzes/gradeQuiz`,
      {
        quiz_id: quiz_id,
        stu_id: stu_id,
        quiz_grade: grade
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

export async function gradeCoursework(
  studentId: number, 
  courseId: number, 
  midtermGrade: number,
  classworkGrade: number,
  quizzesGrade: number
) {
  try {
    const token = await getAuthToken();
    const resp = await axios.post(
      `http://localhost:3001/course_management/addClassWorkGrades/${courseId}/${studentId}`,
      {
        midterm_grade: midtermGrade,
        classwork_grade: classworkGrade,
        quizes_grade: quizzesGrade
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

export async function getGrades(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(`http://localhost:3001/course_management/quizzes/getQuizGrades/${course_id}`, {
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

export async function getClassGrades(course_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.get(`http://localhost:3001/course_management/getClassWorkGrades/${course_id}`, {
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

export async function deleteAnnouncement(ann_id: number) {
  try {
    const token = await getAuthToken();
    const resp = await axios.delete(`http://localhost:3001/announcemnts/removeAnnouncement/${ann_id}`, {
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
