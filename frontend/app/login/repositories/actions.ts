"use server"

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { apiUrl } from "@/common/api";

type LoginTokenClaims = {
  sub?: string;
  username?: string;
  userId?: string;
  role?: string;
  email?: string;
};

export async function loginUser(email: string, password: string) {
  try {
    const resp = await axios.post(apiUrl("/api/auth/login"), {
      email,
      password,
    });

    const token: string | undefined = resp.data?.accessToken;

    if (!token) {
      return { success: false, error: "No token received" };
    }

    const user = jwtDecode<LoginTokenClaims>(token);
    const userId = user.userId ?? user.sub;
    
    const cookieStore = await cookies();
    
    cookieStore.set({
      name: 'accessToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    cookieStore.set({
      name: 'userData',
      value: JSON.stringify({
        username: user.username,
        userId,
        role: user.role,
        email: user.email
      }),
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return { 
      success: true, 
      user: {
        username: user.username,
        userId,
        role: user.role,
        email: user.email
      }, 
      token: token 
    };
    
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data?.error ||
        err.message ||
        "Login failed"
      : err instanceof Error
        ? err.message
        : "Login failed";

    return { success: false, error: message };
  }
}
