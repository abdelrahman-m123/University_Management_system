"use server";

import axios from "axios";
import { getAuthToken } from "@/common/cookieHelpers";
import { apiUrl } from "@/common/api";

export interface ChatContact {
  userId: number;
  fullName: string;
  email: string;
  role: "Doctor" | "Student";
}

export interface ChatMessage {
  id: number;
  chatId: number;
  doctorId: number;
  studentId: number;
  senderId: number;
  message: string;
  timeStamp: string;
}

export interface ChatUnread {
  chatId: number;
  doctorId: number;
  studentId: number;
  unreadCount: number;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return data?.message ?? data?.title ?? error.message;
  }

  return error instanceof Error ? error.message : "Request failed";
}

export async function getChatContacts(role: "student" | "Doctor") {
  try {
    const token = await getAuthToken();
    const endpoint = role === "student" ? "/api/staff" : "/api/students";
    const response = await axios.get(apiUrl(endpoint), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const contacts: ChatContact[] = (response.data ?? [])
      .filter((person: any) =>
        role === "student"
          ? person.roles?.some((personRole: string) => personRole.toLowerCase() === "doctor")
          : true,
      )
      .map((person: any) => ({
        userId: Number(person.userId),
        fullName: person.fullName,
        email: person.email,
        role: role === "student" ? "Doctor" : "Student",
      }))
      .filter((person: ChatContact) => Number.isInteger(person.userId));

    return { success: true, contacts };
  } catch (error) {
    return { success: false, contacts: [], error: getErrorMessage(error) };
  }
}

export async function getChatMessages(doctorId: number, studentId: number) {
  try {
    const token = await getAuthToken();
    const response = await axios.get(apiUrl("/api/chats/messages"), {
      params: { doctorId, studentId },
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: true, messages: response.data as ChatMessage[] };
  } catch (error) {
    return { success: false, messages: [], error: getErrorMessage(error) };
  }
}

export async function sendChatMessage(
  doctorId: number,
  studentId: number,
  content: string,
) {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      apiUrl("/api/chats/messages"),
      { doctorId, studentId, content },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return { success: true, message: response.data as ChatMessage };
  } catch (error) {
    return { success: false, message: undefined, error: getErrorMessage(error) };
  }
}

export async function getUnreadChats() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(apiUrl("/api/chats/unread"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const unreadChats = (response.data ?? []) as ChatUnread[];

    return {
      success: true,
      unreadChats,
      totalUnreadCount: unreadChats.reduce((total, chat) => total + chat.unreadCount, 0),
    };
  } catch (error) {
    return {
      success: false,
      unreadChats: [],
      totalUnreadCount: 0,
      error: getErrorMessage(error),
    };
  }
}

export async function markChatAsRead(doctorId: number, studentId: number) {
  try {
    const token = await getAuthToken();
    await axios.post(
      apiUrl("/api/chats/messages/read"),
      { doctorId, studentId },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
