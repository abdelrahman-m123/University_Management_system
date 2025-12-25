"use server"

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export async function loginUser(email: string, password: string) {
  try {
    const resp = await axios.post("http://localhost:3001/api/auth/login", {
      email,
      password,
    });

    console.log(resp);

    const token: string | undefined = resp.data?.accessToken;

    if (!token) {
      return { success: false, error: "No token received" };
    }

    const user = jwtDecode<any>(token) as any;
    
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
        userId: user.userId,
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
        userId: user.userId,
        role: user.role,
        email: user.email
      }, 
      token: token 
    };
    
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message || "Login failed";
    return { success: false, error: message };
  }
}