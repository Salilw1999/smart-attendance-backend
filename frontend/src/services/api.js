import axios from "axios";

// --- Load dynamic config (from runtime or .env) ---
const config = window.ENV || {};

// URLs from runtime config or environment
const CENTRAL_API_URL = config.API_BASE_URL || process.env.REACT_APP_API_URL;
const LOCAL_API_URL = "http://localhost:8888";

// Detect environment (local vs deployed)
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Determine which backend URL to use
const API_BASE_URL = isLocal
  ? LOCAL_API_URL
  : CENTRAL_API_URL || LOCAL_API_URL; // fallback if central missing

// --- Axios instance ---
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// --- Auth ---
export const login = (username, password) =>
  api.post("/api/auth/login", { username, password });

// --- Students ---
export const fetchStudents = () => api.get("/api/students/");
export const createStudent = (formData) =>
  api.post("/api/students/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateStudent = (id, formData) =>
  api.put(`/api/students/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);

// --- Debug Log ---
console.log(`[API] Using base URL: ${API_BASE_URL}`);
