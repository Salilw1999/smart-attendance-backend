import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

/**
 * ✅ ProtectedRoute (JWT-based)
 * Handles authentication and optional role-based access control.
 */
const ProtectedRoute = ({ children }) => {
  const { token, user, logout } = useAuth();
  const location = useLocation();

  // 🔐 1. No token → redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🧠 2. Validate token expiration
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      console.warn("Token expired. Logging out...");
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    logout();
    return <Navigate to="/login" replace />;
  }

  // 🧭 3. Optional role-based access (future-ready)
  // Example: Only allow admin to access /user-management
  if (user?.role === "viewer" && location.pathname === "/user-management") {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ 4. Authorized → render the page
  return children || <Outlet />;
};

export default ProtectedRoute;
