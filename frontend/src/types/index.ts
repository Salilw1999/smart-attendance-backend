export interface Student {
  id: number;
  name: string;
  photoUrl: string;
  attendance: AttendanceRecord[];
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
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