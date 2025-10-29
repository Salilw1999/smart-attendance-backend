// src/services/api.js
import axios from "axios";

const API_BASE_URL =
  (window.ENV && window.ENV.API_BASE_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8888";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Exported login function (fix for your build error)
export const login = (username, password) =>
  api.post("/api/auth/login", { username, password });

// ✅ Students API
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

// ✅ Upload image only (optional)
export const uploadImage = (formData) =>
  api.post("/api/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
