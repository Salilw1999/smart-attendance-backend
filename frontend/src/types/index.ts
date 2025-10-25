export interface Student {
  id: number;
  name: string;
  photoUrl: string;
  attendance: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  [key: string]: any;
}

export interface AttendanceSummary {
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}