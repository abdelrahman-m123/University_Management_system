"use client";

import { useState, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateStaff } from "./CreateStaff";
import Sidebar from "@/components/sidebar";
import { getAllStaff, updateStaffRole, deleteStaff } from "../actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogAssignCourse } from "./AssignCourse";
import { DialogEditStaff } from "./EditStaff";

export function StaffTable({ initialData }) {
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "ta":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { accessorKey: "staff_name", header: "Name" },
    { accessorKey: "staff_email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRoleColor(row.original.role)}`}>
          {row.original.role}
        </span>
      ),
    },
    { accessorKey: "contact_info", header: "Contact Info" },
    // { 
    //   accessorKey: "office_hours", 
    //   header: "Office Hours",
    //   cell: ({ row }) => (
    //     <span>
    //       {row.original.office_hours ? new Date(row.original.office_hours).toLocaleString() : 'Not set'}
    //     </span>
    //   )
    // },
  ];

  const handleSearch = async (query: string = searchQuery, role: string = roleFilter) => {
    setIsLoading(true);
    try {
      const response = await getAllStaff(query, role);
      if (response?.staff) {
        setData(response.staff);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTable = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllStaff(searchQuery,roleFilter);
      if (response?.staff) {
        setData(response.staff);
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (staffId: number, newRole: string) => {
    const res = await updateStaffRole(staffId, newRole);
    await updateTable();
    return res;
  };

  const handleDeleteStaff = async (staffId: number) => {
    const res = await deleteStaff(staffId);
    await updateTable();
    return res;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleSearch(value, roleFilter);
    }, 500); // 500ms delay
  };

  const handleRoleFilterChange = (e: string) => {
    const value = e;
    const roleValue = value === "any" ? "" : value; 
    setRoleFilter(roleValue);
    handleSearch(searchQuery, roleValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleSearch(searchQuery, roleFilter);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
        
        {(row.original.role == "Doctor" || row.original.role == "TA") ? (<DialogAssignCourse row={row.original} update={updateTable}></DialogAssignCourse>) : null}
        <DialogEditStaff row={row.original} update={updateTable}></DialogEditStaff>

        </div>

        
        
        // <DialogCreateStaff 
        //   handleUpdateRole={handleUpdateRole} 
        //   handleDelete={handleDeleteStaff} 
        //   staff={row.original} 
        // />
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px", flex: 1 }}>
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-semibold text-gray-800">
              Staff Management
            </h1>
            <DialogCreateStaff update={updateTable} />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex w-[400px] max-w-sm items-center gap-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              
            </div>
            <Select value={roleFilter} onValueChange={(e) => handleRoleFilterChange(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Roles</SelectItem>
                <SelectItem value="TA">Teaching Assistant</SelectItem>
                <SelectItem value="Doctor">Doctor/Professor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button onClick={() => handleSearch(searchQuery, roleFilter)} disabled={isLoading}>
                Search
              </Button> */}
          </div>

          <DataTable columns={columnsWithActions} data={data} />
        </div>
      </div>
    </div>
  );
}