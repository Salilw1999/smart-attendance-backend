import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import theme from "./theme";

// ✅ Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import ClassAttendance from "./pages/ClassAttendance";
import UserManagement from "./pages/UserManagement";

// ✅ Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* 🟢 Public route */}
            <Route path="/login" element={<Login />} />

            {/* 🔒 Protected Routes (with Layout wrapper) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Attendance />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/class-attendance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClassAttendance />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 🧑‍💼 Admin-only (optional check inside ProtectedRoute) */}
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 🚫 Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
