import axios from "axios";
import { Student, AttendanceRecord } from "../interfaces/types";

const config = (window as any).ENV || {};
const API_BASE_URL = config.API_BASE_URL;
const API_PREFIX = config.API_PREFIX;

/**
 * ✅ ATTENDANCE API
 */
export const takeSnapshot = async (imageData: string): Promise<Student[]> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/attendance/snapshot`,
    { image: imageData },
    { withCredentials: true }
  );
  return response.data;
};

export const uploadPhoto = async (formData: FormData): Promise<Student[]> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/attendance/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );
  return response.data;
};

export const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/attendance/records`,
    { withCredentials: true }
  );
  return response.data;
};

export const exportAttendanceToExcel = async (): Promise<void> => {
  const response = await axios.get(`${API_BASE_URL}/api/attendance/export`, {
    responseType: "blob",
    withCredentials: true,
  });

  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "attendance_records.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const fetchAttendanceData = async (
  params: Record<string, any> = {}
): Promise<Student[]> => {
  const query = Object.keys(params).length
    ? `?${new URLSearchParams(params).toString()}`
    : "";
  const response = await axios.get(
    `${API_BASE_URL}/attendance${query}`,
    { withCredentials: true }
  );
  return response.data;
};

export const fetchAttendanceReports = async (
  params: Record<string, any>
): Promise<AttendanceRecord[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/attendance/reports`,
    { params, withCredentials: true }
  );
  return response.data;
};

/**
 * ✅ STUDENTS API (FULL CRUD)
 */
export const fetchStudents = async (): Promise<Student[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/students`,
    { withCredentials: true }
  );
  return response.data;
};

export const createStudent = async (data: any): Promise<Student> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/students`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const updateStudent = async (id: number, data: any): Promise<Student> => {
  const response = await axios.put(
    `${API_BASE_URL}/api/students/${id}`,
    data,
    { withCredentials: true }
  );
  return response.data;
};

export const deleteStudent = async (id: number): Promise<any> => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/students/${id}`,
    { withCredentials: true }
  );
  return response.data;
};

/**
 * ✅ NEW: Student Photo Upload API
 */
export const uploadStudentPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axios.post(
    `${API_BASE_URL}/api/students/photo`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );

  return response.data.photo_url;
};

/**
 * ✅ AUTH API
 */
export const login = async (username: string, password: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/login`,
    { username, password },
    { withCredentials: true }
  );
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/change-password`,
    {
      current_password: currentPassword,
      new_password: newPassword,
    },
    { withCredentials: true }
  );
  return response.data;
};
