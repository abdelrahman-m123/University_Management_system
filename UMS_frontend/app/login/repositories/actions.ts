"use server"

import axios from "axios";
import {jwtDecode} from "jwt-decode";

export async function loginUser(email: string, password: string) {
  try {
    const resp = await axios.post("http://localhost:3001/api/auth/login", {
      email,
      password,
    });


    console.log(resp);

    const token: string | undefined = resp.data?.accessToken;

    const user = token ? (jwtDecode<any>(token) as any) : null;

    return { success: true, user, token: token };
  } catch (err: any) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? err.response.data
        : err.message || "Login failed";
    return { success: false, error: message };
  }
}