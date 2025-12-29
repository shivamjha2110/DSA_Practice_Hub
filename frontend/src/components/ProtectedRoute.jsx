import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="container-app py-14">
        <div className="card p-8">
          <div className="text-lg font-extrabold tracking-tight">Loading…</div>
          <div className="mt-2 muted">Preparing your workspace.</div>
        </div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
