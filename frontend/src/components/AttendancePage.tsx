import React, { useEffect, useState } from 'react';
import { Student } from '../interfaces/types';
import { fetchAttendanceData } from '../services/api'; // API import

const AttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAttendanceData();
        setAttendanceData(data);
      } catch (err) {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {attendanceData.map(student => (
        <div key={student.id}>
          <p>{student.name}</p>
        </div>
      ))}
    </div>
  );
};

export default AttendancePage;
