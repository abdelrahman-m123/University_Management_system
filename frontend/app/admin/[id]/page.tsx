"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoutes";
import Sidebar from "../../../components/sidebar";
import {
  Mail,
  Phone,
  User,
  Briefcase,
  Calendar,
  Link,
  Star,
  FileText,
  GraduationCap,
  Globe,
  Award,
} from "lucide-react";
import { getStaffById } from "../actions";
import { DialogEditStaff } from "./components/EditStaff";
import { PageHeader } from "@/components/PageHeader";
interface StaffDetails {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  phone: string | null;
  role: string;
  contact_info: string | null;
  profile_link: string | null;
  office_hours: string | null;
  courses: Course[];
  attributes: Record<string, any>;
}

interface Course {
  course_id: number;
  course_code?: string;
  course_name: string;
  credit_hours: number;
}

const StaffProfilePage: React.FC = () => {
  const params = useParams();
  const staffId = Number(params.id);

  const [staff, setStaff] = useState<StaffDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const UpdatePage = async () => {
    try {
      const staffResponse = await getStaffById(staffId);
      if (staffResponse.success && staffResponse.staff) {
        setStaff(staffResponse.staff);
      }
    } catch (error) {
      console.error("Error refreshing staff details:", error);
    }
  };

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);

        // Fetch staff details
        const staffResponse = await getStaffById(staffId);
        console.log(staffResponse);
        if (staffResponse.success && staffResponse.staff) {
          setStaff(staffResponse.staff);
        } else {
          console.error("Failed to fetch staff:", staffResponse.error);
        }
      } catch (error) {
        console.error("Error fetching staff details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (Number.isInteger(staffId)) {
      fetchStaffDetails();
    }
  }, [staffId]);

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "super_admin":
        return "bg-purple-100 text-purple-800 ";
      case "doctor":
        return "bg-blue-100 text-blue-800 ";
      case "ta":
        return "bg-green-100 text-green-800 ";
      default:
        return "bg-gray-100 text-gray-800 ";
    }
  };

  const formatOfficeHours = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getAttributeIcon = (attributeName: string) => {
    switch (attributeName.toLowerCase()) {
      case "rating":
        return <Star size={16} />;
      case "numberofresearchpapers":
        return <FileText size={16} />;
      case "specialization":
        return <GraduationCap size={16} />;
      case "remotework":
        return <Globe size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center">Loading staff details...</div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!staff) {
    return (
      <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ padding: "20px", flex: 1 }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center text-red-600">
                Staff member not found
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const assignedCourses = staff.courses ?? [];
  const profileTabs = (
    <nav className="flex min-w-max gap-6 overflow-x-auto">
      {[
        ["info", "Information"],
        ["courses", `Courses (${assignedCourses.length})`],
        ["attributes", "Performance"],
      ].map(([value, label]) => (
        <button
          key={value}
          onClick={() => setActiveTab(value)}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === value
              ? "border-blue-900 text-blue-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageHeader
            title={staff.staff_name}
            description={
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span
                  className={"inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium " + getRoleColor(staff.role)}
                >
                  {staff.role}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Mail size={14} />
                  {staff.staff_email}
                </span>
                {staff.phone && (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Phone size={14} />
                    {staff.phone}
                  </span>
                )}
              </div>
            }
            breadcrumbs={[
              { label: "Staff Management", href: "/admin" },
              { label: "Profile" },
            ]}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {staff.attributes?.numberOfResearchPapers && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                    <div className="text-lg font-bold text-blue-900">
                      {staff.attributes.numberOfResearchPapers}
                    </div>
                    <div className="text-xs text-slate-600">
                      {staff.attributes.numberOfResearchPapers === 1 ? "Paper" : "Papers"}{" "}
                      Published
                    </div>
                  </div>
                )}
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                  <div className="text-lg font-bold text-blue-900">
                    {assignedCourses.length}
                  </div>
                  <div className="text-xs text-slate-600">
                    {assignedCourses.length === 1 ? "Course" : "Courses"} Assigned
                  </div>
                </div>
                <DialogEditStaff
                  row={{
                    staff_id: staff.staff_id,
                    staff_name: staff.staff_name,
                    staff_email: staff.staff_email,
                    role: staff.role,
                    phone: staff.phone || "",
                    contact_info: staff.contact_info || "",
                    profile_link: staff.profile_link || "",
                    office_hours: staff.office_hours || "",
                    attributes: staff.attributes || {},
                  }}
                  update={UpdatePage}
                />
              </div>
            }
            tabs={profileTabs}
          />
          <div className="mx-auto max-w-6xl pt-4">
            <div className="p-2 sm:p-0">
              {/* Tab Content */}
              <div>
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Mail size={16} />
                            <span className="font-medium">Email</span>
                          </div>
                          <p className="text-gray-900">{staff.staff_email}</p>
                        </div>

                        {staff.phone && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <Phone size={16} />
                              <span className="font-medium">Phone</span>
                            </div>
                            <p className="text-gray-900">{staff.phone}</p>
                          </div>
                        )}

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Briefcase size={16} />
                            <span className="font-medium">Role</span>
                          </div>
                          <p className="text-gray-900">{staff.role}</p>
                        </div>

                        {staff.contact_info && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <User size={16} />
                              <span className="font-medium">
                                Additional Info
                              </span>
                            </div>
                            <p className="text-gray-900">
                              {staff.contact_info}
                            </p>
                          </div>
                        )}

                        {staff.office_hours && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <Calendar size={16} />
                              <span className="font-medium">Office Hours</span>
                            </div>
                            <p className="text-gray-900">
                              {formatOfficeHours(staff.office_hours)}
                            </p>
                          </div>
                        )}

                        {staff.profile_link && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <Link size={16} />
                              <span className="font-medium">Profile Link</span>
                            </div>
                            <a
                              href={staff.profile_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-900 hover:underline"
                            >
                              {staff.profile_link}
                            </a>
                          </div>
                        )}
                      </div>

                      {Object.keys(staff.attributes || {}).length > 0 && (
                        <><h2 className="text-xl font-semibold mb-3 text-gray-900 mt-3">
                            Additional Information
                          </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          
                          {Object.entries(staff.attributes).map(
                            ([key, value]) =>
                              key === "specialization" ||
                              key === "remoteWork" ? (
                                <div
                                  key={key}
                                  className="border rounded-lg p-4 bg-gray-50"
                                >
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    {getAttributeIcon(key)}
                                    <span className="font-medium">
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1).replace(/([A-Z])/g, " $1")}
                                    </span>
                                  </div>
                                  <p className="text-gray-900 text-lg">
                                    {key === "remoteWork"
                                      ? value == 1
                                        ? "Yes"
                                        : "No"
                                      : value}
                                  </p>
                                </div>
                              ) : null
                          )}
                        </div></>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "courses" && (
                  <div>
                    {assignedCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignedCourses.map((course) => {
                          const courseParts = course.course_name.split(": ");
                          const courseCode = course.course_code || courseParts[0] || "";
                          const courseTitle =
                            courseParts[1] || course.course_name;

                          return (
                            <div
                              key={course.course_id}
                              className="border rounded-lg p-4 transition-shadow "
                              
                            >
                              <h3 className="font-semibold text-lg text-blue-900 mb-1">
                                {courseCode}
                              </h3>
                              <p className="text-gray-700 mb-3">
                                {courseTitle}
                              </p>
                              <div className="text-sm text-gray-600">
                                <span>{course.credit_hours} Credit Hours</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Briefcase
                          size={48}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <p className="text-gray-600">No courses assigned yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "attributes" && (
                  <div>
                    {Object.keys(staff.attributes || {}).length > 0 ? (
                      <>
                        {" "}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(staff.attributes).map(
                            ([key, value]) =>
                              key !== "specialization" &&
                              key !== "remoteWork" ? (
                                <div
                                  key={key}
                                  className="border rounded-lg p-4 bg-gray-50"
                                >
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    {getAttributeIcon(key)}
                                    <span className="font-medium">
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1).replace(/([A-Z])/g, " $1")}
                                    </span>
                                  </div>
                                  <p className="text-gray-900 text-lg">
                                    {key === "remoteWork"
                                      ? value === "0"
                                        ? "Yes"
                                        : "No"
                                      : value}
                                  </p>
                                </div>
                              ) : null
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Award
                          size={48}
                          className="mx-auto text-gray-400 mb-3"
                        />
                        <p className="text-gray-600">
                          No attributes defined yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default StaffProfilePage;
