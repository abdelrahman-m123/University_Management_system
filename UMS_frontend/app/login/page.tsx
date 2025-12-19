// pages/login.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "./repositories/actions";

const Login: React.FC = () => {
  const [email, setEmail] = useState("email@emaill.com");
  const [username, setUsername] = useState("Abdelrahman Mostafa");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("student"); // demo purposes
  const [temprole, settempRole] = useState("student"); // demo purposes
  const [error, setError] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    // fake login: store token and role
    const response = await loginUser(email, password);
    if (response.success === true) {
      console.log(response.user);
      console.log("token: ", response.token)
      const user = response.user;
      const role = user.role;
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("role", user.role);
      localStorage.setItem("token", response.token? response.token : "");

      if (role == "student") {
        router.push("/Courses/student");
      } else if (role == "Doctor" || role == "TA") {
        router.push("/Courses/Doctor");
      } else if (role == "admin") {
        router.push("/admin");
      }
    }else {
      console.log("login error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-100">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Role Select */}
           <div className="space-y-2">
        <select
          value={temprole}
          onChange={(e) => {
            if(e.target.value  == "staff"){
            }else if(e.target.value  == "student"){
                settempRole("Student");
            }else if(e.target.value  == "admin"){
              setEmail("SuperAdmin@emaill.com");
              settempRole("Admin");
            }
            else if(e.target.value  == "Doctor"){
              setEmail("ahmedmohamed@university.com");
              settempRole("Doctor");
            }
            else if(e.target.value  == "TA"){
              setEmail("fatimaali@university.com");
              settempRole("TA");
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
        >
          <option value="student">Student</option>
          <option value="Doctor">Doctor</option>
          <option value="TA">TA</option>
          <option value="admin">Admin</option>
        </select>
      </div> 

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-900/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </button>
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
