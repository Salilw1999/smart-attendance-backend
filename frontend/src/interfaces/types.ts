// src/interfaces/types.ts

// 🧑‍🎓 Student type
export interface Student {
  id: string;
  name: string;
  avatar?: string;
  rollNumber?: string;
  email?: string;
  department?: string;
  [key: string]: any; // allows extra fields from API
}

// 📅 Individual attendance record
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date string
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  [key: string]: any;
}
