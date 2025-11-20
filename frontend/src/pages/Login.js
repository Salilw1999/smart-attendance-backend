import { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import background from "../assets/layout-background2.jpg";

// ✅ Validation Schema
const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🧠 If already logged in → redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      setLoading(true);

      const result = await login(values.username, values.password);

      setLoading(false);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Invalid username or password");
      }
    },
  });

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: 6,
            borderRadius: 4,
            width: "100%",
            maxWidth: 500,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          {/* ✅ Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <img src={logo} alt="App Logo" style={{ width: 80, height: 80 }} />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, color: "#fff", textShadow: "0 0 8px rgba(0,0,0,0.3)" }}
          >
            Student Attendance System
          </Typography>

          {/* ✅ Login Form */}
          <form onSubmit={formik.handleSubmit}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              margin="normal"
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              sx={{
                input: {
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 1,
                  color: "#000",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#999" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                input: {
                  backgroundColor: "rgba(255,255,255,0.9)",
                  borderRadius: 1,
                  color: "#000",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#999" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.4,
                fontWeight: 700,
                fontSize: "1.1rem",
                borderRadius: 3,
                background: "linear-gradient(90deg, #2196f3 0%, #00b0ff 100%)",
                boxShadow: "0 0 10px rgba(33,150,243,0.5)",
                "&:hover": {
                  background: "linear-gradient(90deg, #00b0ff 0%, #2196f3 100%)",
                  boxShadow: "0 0 20px rgba(33,150,243,0.7)",
                },
              }}
            >
              {loading ? <CircularProgress size={26} sx={{ color: "white" }} /> : "Sign In"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
