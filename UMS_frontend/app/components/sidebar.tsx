// components/Sidebar.tsx
"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

const Sidebar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 min-h-screen p-6">
  {/* Header */}
  <div className="mb-8">
    <h3 className="text-xl font-bold text-gray-800">UMS</h3>
    
  </div>

  {/* Navigation Links */}
  <nav className="space-y-1">
    <Link 
      href="/dashboard" 
      className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
    >
       Home
    </Link>
    
    {role === "student" && (
      <Link 
        href="/student" 
        className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
      >
         Student Dashboard
      </Link>
    )}
    
    {(role === "staff" || role === "admin") && (
      <Link 
        href="/staff" 
        className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
      >
        💼 Staff Dashboard
      </Link>
    )}
    
    {role === "admin" && (
      <Link 
        href="/admin" 
        className="block px-4 py-3 text-gray-700 rounded-l hover:bg-white hover:border hover:border-black-100 transition-all duration-100 font-medium"
      >
        ⚙️ Admin Dashboard
      </Link>
    )}
  </nav>

  {/* Current Role Badge */}
  <div className="absolute bottom-6">
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
      {role} Access
    </span>
  </div>
</div>
  );
};

export default Sidebar;
