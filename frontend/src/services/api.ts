import axios from 'axios';
import { Student, AttendanceRecord } from '../interfaces/types';

const config = (window as any).ENV || {};
const API_BASE_URL = config.API_BASE_URL;
const API_PREFIX = config.API_PREFIX;

/** 📸 Take snapshot */
export const takeSnapshot = async (imageData: string): Promise<Student[]> => {
  const response = await axios.post(`${API_BASE_URL}/api/attendance/snapshot`, { image: imageData });
  return response.data;
};

/** 📷 Upload photo */
export const uploadPhoto = async (formData: FormData): Promise<Student[]> => {
  const response = await axios.post(`${API_BASE_URL}/api/attendance/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/** 📊 Fetch attendance records */
export const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const response = await axios.get<AttendanceRecord[]>(`${API_BASE_URL}/api/attendance/records`);
  return response.data;
};

/** 📁 Export attendance to Excel */
export const exportAttendanceToExcel = async (): Promise<void> => {
  const response = await axios.get(`${API_BASE_URL}/api/attendance/export`, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'attendance_records.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** 🧑‍🎓 Fetch attendance data */
export const fetchAttendanceData = async (params: Record<string, any> = {}): Promise<Student[]> => {
  const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await axios.get<Student[]>(`${API_BASE_URL}/attendance${query}`);
  return response.data;
};

/** 📄 Fetch attendance reports */
export const fetchAttendanceReports = async (params: Record<string, any>): Promise<AttendanceRecord[]> => {
  const response = await axios.get<AttendanceRecord[]>(`${API_BASE_URL}/api/attendance/reports`, { params });
  return response.data;
};

/** 🧾 Fetch all students */
export const fetchStudents = async (params: Record<string, any> = {}): Promise<Student[]> => {
  const response = await axios.get<Student[]>(`${API_BASE_URL}/students`, { params });
  return response.data;
};

/** 🔐 Login user */
export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    username,
    password,
  });
  return response.data;
};

/** 🔄 Change password */
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/change-password`,
    {
      current_password: currentPassword,
      new_password: newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Setup axios interceptor for auth headers
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
