import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function AdminRoute() {
  const { user, isLoadingAuth, isAuthenticated, authChecked } = useAuth();
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login?returnTo=%2Fadmin" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}