import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Load variables
const {
  REACT_APP_URL_TYPE,
  REACT_APP_API_PROTOCOL,
  REACT_APP_API_HOST,
  REACT_APP_API_PORT,
  REACT_APP_API_PREFIX,
} = process.env;

// ------------------------------
// 🌐 BASE URL LOGIC
// ------------------------------
let API_BASE_URL = "";

// 1️⃣ Central deployment
if (REACT_APP_URL_TYPE === "central") {
  API_BASE_URL = "https://test-salil.smart-iam.com/api";
}

// 2️⃣ If env host + port provided → use them as-is
else if (REACT_APP_API_HOST && REACT_APP_API_PORT) {
  API_BASE_URL = `${REACT_APP_API_PROTOCOL || "http"}://${REACT_APP_API_HOST}:${REACT_APP_API_PORT}${REACT_APP_API_PREFIX || ""}`;
}

// 3️⃣ Fallback → Browser's IP + port 8888 (YOUR REQUIREMENT)
else {
  const base_ip = window.location.hostname;
  API_BASE_URL = `http://${base_ip}:8888`;
}

// ------------------------------
// 🔧 AXIOS INSTANCE
// ------------------------------
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ------------------------------
// 🔐 SESSION LOGIC
// ------------------------------
function logoutNow() {
  localStorage.removeItem("user");
  localStorage.removeItem("AdminToken");
  window.location.href = "/login";
}

function scheduleAutoLogout(token) {
  try {
    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000 - Date.now();
    if (expTime <= 0) return logoutNow();
    setTimeout(logoutNow, expTime);
  } catch {
    logoutNow();
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("AdminToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    scheduleAutoLogout(token);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) logoutNow();
    return Promise.reject(err);
  }
);

// ------------------------------
// 🔑 AUTH
// ------------------------------
export const login = (username, password) =>
  api.post(
    "/api/auth/login",
    new URLSearchParams({ username, password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

export const fetchProfile = () => api.get("/api/auth/me");

// ------------------------------
// 🧑‍🎓 STUDENTS
// ------------------------------
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

// ------------------------------
// 🔐 USERS + ROLES + PERMISSIONS
// ------------------------------
export const fetchUsers = () => api.get("/api/users");
export const createUser = (data) => api.post("/api/users", data);
export const fetchRoles = () => api.get("/api/roles");
export const createRole = (data) => api.post("/api/roles", data);
export const fetchPermissions = (roleId) =>
  api.get(`/api/permissions/${roleId}`);
export const updatePermissions = (roleId, data) =>
  api.put(`/api/permissions/${roleId}`, data);

// ------------------------------
console.log(`🟢 [API] Using base URL → ${API_BASE_URL}`);
