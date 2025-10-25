import React, { useEffect, useState } from 'react';
import { fetchAttendanceData } from '../services/api';
import AttendanceTable from './AttendanceTable';
import StudentCard from './StudentCard';

const Dashboard: React.FC = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAttendanceData = async () => {
            try {
                const data = await fetchAttendanceData();
                setAttendanceData(data);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoading(false);
            }
        };

        getAttendanceData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Student Attendance Dashboard</h1>
            <div className="student-cards">
                {attendanceData.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>
            <AttendanceTable students={attendanceData} />
        </div>
    );
};

export default Dashboard;