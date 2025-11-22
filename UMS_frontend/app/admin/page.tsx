"use server";

import ProtectedRoute from "../../components/ProtectedRoutes";
import { getAllStaff } from "./actions";
import { StaffTable } from "./components/staffTable";

const StaffManagement = async () => {
  const response = await getAllStaff("", "");
  const data = response?.staff ?? [];

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <StaffTable initialData={data}  />
    </ProtectedRoute>
  );
};

export default StaffManagement;