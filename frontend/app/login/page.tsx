// pages/login.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "./repositories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("abdelrahman@university.com");
  const [password, setPassword] = useState("password");
  const [temprole, settempRole] = useState("student");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleDemoAccountChange = (value: string) => {
    const accounts: Record<string, { email: string; role: string }> = {
      student: { email: "abdelrahman@university.com", role: "student" },
      registrationTester: { email: "registration.tester@university.com", role: "student" },
      Doctor: { email: "ahmed.hassan@uni.com", role: "Doctor" },
      TA: { email: "fatimaali@university.com", role: "TA" },
      admin: { email: "admin.one@university.com", role: "admin" },
    };

    const account = accounts[value];
    if (account) {
      setEmail(account.email);
      settempRole(account.role);
      setPassword("password");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await loginUser(email, password);
    if (response.success === true && response.user) {
      const user = response.user;
      const role = user.role ?? "";
      localStorage.setItem("username", user.username ?? "");
      localStorage.setItem("userId", user.userId ?? "");
      localStorage.setItem("role", role);
      localStorage.setItem("token", response.token? response.token : "");

      if (role == "student") {
        router.push("/Courses/student");
      } else if (role == "Doctor" || role == "TA") {
        router.push("/Courses/Doctor");
      } else if (role == "admin") {
        router.push("/admin");
      }
    } else {
      setError(response.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to your university account</p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="login-email"
              type="email"
                placeholder="you@university.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
                className="h-11 pl-10"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="login-password"
              type="password"
                placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
                className="h-11 pl-10"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {/* Demo account selector */}
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="demo-account" className="text-sm font-medium text-slate-700">
                Demo account
              </label>
              <span className="text-xs text-slate-500">Autofills credentials</span>
            </div>
            <Select value={temprole} onValueChange={handleDemoAccountChange}>
              <SelectTrigger id="demo-account" className="h-11 w-full bg-white">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="registrationTester">Registration Tester (1 course)</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="TA">Teaching Assistant</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="h-11 w-full text-base"
          >
            Sign In
          </Button>
        </form>

        {/* Additional Links */}
        {/* <div className="text-center space-y-2">
          <a
            href="#"
            className="text-sm text-blue-900 hover:text-blue-900/90 transition-colors duration-200"
          >
            Forgot your password?
          </a>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-blue-900 hover:text-blue-900/90 font-semibold transition-colors duration-200"
            >
              Sign up
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
