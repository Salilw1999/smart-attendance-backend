import React, { useState, useEffect } from 'react';
import { Student } from '../interfaces/types';
import { fetchAttendanceData } from '../services/api';
import StudentCard from '../components/StudentCard';
import AttendanceTable from '../components/AttendanceTable';

const Home: React.FC = () => {
  // ⚡ Explicitly type the state as Array<Student>
  const [attendanceData, setAttendanceData] = useState<Array<Student>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data: Student[] = await fetchAttendanceData();
        setAttendanceData(data); // ✅ Type matches Array<Student>
      } catch (err) {
        console.error(err);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Attendance</h1>
      <div className="student-cards">
        {attendanceData.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
      <AttendanceTable attendanceData={attendanceData} />
    </div>
  );
};

export default Home;
