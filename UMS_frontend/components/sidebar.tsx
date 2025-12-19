// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUsername(localStorage.getItem("username"));
  }, []);

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800">UMS</h3>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {/* <Link
          href="/dashboard"
          className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
        >
          Home
        </Link> */}

        {role === "student" && (
          <>
            {/* <Link
              href="/student"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Home
            </Link> */}
            <Link
              href="/Courses/student"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Courses
            </Link>
            <Link
              href="/registeration/student"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Course Registeration
            </Link>
          </>
        )}

        {(role == "Doctor" || role == "TA") && (
          <>
            <Link
              href="/Courses/Doctor"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Assigned Courses
            </Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link
              href="/admin"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              User Management
            </Link>
            <Link
              href="/registeration/staff"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Course Applications
            </Link>
            <Link
              href="/Courses/admin"
              className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
            >
              Course Management
            </Link>
          </>
        )}
      </nav>

      {/* Bottom area */}
      <div className="mt-6 absolute bottom-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold">
            {getInitials(username)}
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-800">{username ?? "User"}</div>
            <div className="text-xs text-gray-500 capitalize">{role ?? "guest"}</div>
          </div>
        </div>

        <Button variant={"outline"} className="w-full" onClick={()=>{
          localStorage.clear();
          router.push("/login");

        }}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
