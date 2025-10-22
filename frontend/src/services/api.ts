import axios from 'axios';
import { Student, AttendanceRecord } from '../interfaces/types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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
  const response = await axios.get<Student[]>(`${API_BASE_URL}/api/attendance${query}`);
  return response.data;
};

/** 📄 Fetch attendance reports */
export const fetchAttendanceReports = async (params: Record<string, any>): Promise<AttendanceRecord[]> => {
  const response = await axios.get<AttendanceRecord[]>(`${API_BASE_URL}/api/attendance/reports`, { params });
  return response.data;
};

/** 🧾 Fetch all students */
export const fetchStudents = async (params: Record<string, any> = {}): Promise<Student[]> => {
  const response = await axios.get<Student[]>(`${API_BASE_URL}/api/students`, { params });
  return response.data;
};


