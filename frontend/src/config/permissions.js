// src/config/permissions.js

/**
 * 🧩 Role-based route access configuration
 * Defines which routes each role can access in the dashboard.
 * Used by ProtectedRoute and Layout for visibility & navigation control.
 */
export const PERMISSIONS = {
  admin: {
    canAccess: [
      "/",
      "/dashboard",
      "/students",
      "/attendance",
      "/class-attendance",
      "/user-management",
      "/roles",
      "/permissions",
    ],
    canEdit: true,
    canDelete: true,
  },

  teacher: {
    canAccess: [
      "/",
      "/dashboard",
      "/students",
      "/attendance",
      "/class-attendance",
    ],
    canEdit: true,
    canDelete: false,
  },

  viewer: {
    canAccess: ["/", "/dashboard",
      "/class-attendance",
    ],
    canEdit: false,
    canDelete: false,
  },
};
