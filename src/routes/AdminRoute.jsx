import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  return isAuthenticated && user?.role === "Admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default AdminRoute;
