"use server"

import { cookies } from "next/headers";

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token;
}

export async function getUserData() {
  const cookieStore = await cookies();
  const userDataStr = cookieStore.get('userData')?.value;
  
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  
  return null;
}

export async function isAuthenticated() {
  const token = await getAuthToken();
  return !!token;
}

export async function getUserRole() {
  const userData = await getUserData();
  return userData?.role || null;
}

export async function logout() {
  const cookieStore = await cookies();
  
  cookieStore.delete('accessToken');
  cookieStore.delete('userData');
  
  return { success: true, message: 'Logged out successfully' };
}