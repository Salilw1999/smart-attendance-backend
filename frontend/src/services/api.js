// src/services/api.js
import axios from "axios";

const config = window.ENV || {};
const API_BASE_URL = config.API_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:8888";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth (if needed)
export const login = (username, password) => api.post("/api/auth/login", { username, password });

// Students (multipart)
export const fetchStudents = () => api.get("/api/students/");
export const createStudent = (formData) =>
  api.post("/api/students/", formData, { headers: { "Content-Type": "multipart/form-data" }});
export const updateStudent = (id, formData) =>
  api.put(`/api/students/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" }});
export const deleteStudent = (id) => api.delete(`/api/students/${id}`);
