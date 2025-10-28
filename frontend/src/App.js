import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';

// Components
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Default route → Dashboard */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Students */}
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <Layout>
                    <Students />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Attendance */}
            <Route
              path="/attendance"
              element={
                <PrivateRoute>
                  <Layout>
                    <Attendance />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Any unknown route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
