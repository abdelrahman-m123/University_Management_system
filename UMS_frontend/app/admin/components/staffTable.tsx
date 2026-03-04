"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogCreateStaff } from "./CreateStaff";
import Sidebar from "@/components/sidebar";
import { getAllStaff, updateStaffRole, deleteStaff } from "../actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogAssignCourse } from "./AssignCourse";
import { DialogEditStaff } from "./EditStaff";
import { CustomPagination } from "@/components/CustomPagination";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Trash2, 
} from "lucide-react";

export function StaffTable({ initialData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

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

  const handleRowClick = (staffId: number) => {
    router.push(`/admin/${staffId}`);
  };

  const handleDeleteClick = (staff: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (staffToDelete) {
      const res = await deleteStaff(staffToDelete.staff_id);
      console.log(staffToDelete.staff_id);
      if (res.success) {
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
        await updateTable();
      }
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
  ];

  const fetchData = async (page: number = 1, search: string = "", role: string = "") => {
    setIsLoading(true);
    try {
      const response = await getAllStaff(search, role, page, pageSize);
      if (response?.staff) {
        setData(response.staff);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string = searchQuery, role: string = roleFilter) => {
    setCurrentPage(1);
    fetchData(1, query, role);
  };

  const updateTable = async (): Promise<void> => {
    fetchData(currentPage, searchQuery, roleFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, searchQuery, roleFilter);
  };

  const handleUpdateRole = async (staffId: number, newRole: string) => {
    const res = await updateStaffRole(staffId, newRole);
    await updateTable();
    return res;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch(value, roleFilter);
    }, 500);
  };

  const handleRoleFilterChange = (e: string) => {
    const value = e;
    const roleValue = value === "any" ? "" : value; 
    setRoleFilter(roleValue);
    setCurrentPage(1);
    fetchData(1, searchQuery, roleValue);
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
    updateTable();
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
        <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
          {(row.original.role == "Doctor" || row.original.role == "TA") ? (
            <DialogAssignCourse row={row.original} update={updateTable} />
          ) : null}
          <DialogEditStaff row={row.original} update={updateTable} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => handleDeleteClick(row.original, e)}
          >
            <Trash2></Trash2>
          </Button>
        </div>
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
          </div>

          <DataTable 
            columns={columnsWithActions} 
            data={data}
            onRowClick={(row) => handleRowClick(row.staff_id)}
          />
        </div>
        
        <div className="mt-4">
          <CustomPagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {staffToDelete?.staff_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}