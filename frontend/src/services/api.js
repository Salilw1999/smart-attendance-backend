import axios from "axios";

// --- Load environment variables (.env) ---
const {
  REACT_APP_URL_TYPE,
  REACT_APP_API_PROTOCOL,
  REACT_APP_API_HOST,
  REACT_APP_API_PORT,
  REACT_APP_API_PREFIX,
} = process.env;

// --- Determine base URL ---
let API_BASE_URL = "";

// Case 1: Central (Production)
if (REACT_APP_URL_TYPE === "central") {
  API_BASE_URL = "https://test-salil.smart-iam.com/api";
}
// Case 2: Use .env API_HOST + PORT if provided
else if (REACT_APP_API_HOST && REACT_APP_API_PORT) {
  API_BASE_URL = `${REACT_APP_API_PROTOCOL || "http"}://${REACT_APP_API_HOST}:${REACT_APP_API_PORT}${REACT_APP_API_PREFIX || ""}`;
}
// Case 3: Default → IP-based auto-detection
else {
  const base_ip = window.location.hostname;
  API_BASE_URL = `http://${base_ip}:8888`;
}

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

// --- Debug log ---
console.log(`[API] Using base URL: ${API_BASE_URL}`);
