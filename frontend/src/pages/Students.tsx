import React, { useEffect, useState } from 'react';
import { fetchStudents, uploadPhoto } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import ManualPhotoUpload from '../components/ManualPhotoUpload';
import AttendanceTable from '../components/AttendanceTable';
import StudentCard from '../components/StudentCard';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await fetchStudents();
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    const handlePhotoUpload = async (photo) => {
        try {
            await uploadPhoto(photo);
            // Optionally refresh the student list or update state
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Students</h1>
            <CameraCapture onCapture={handlePhotoUpload} />
            <ManualPhotoUpload onUpload={handlePhotoUpload} />
            <AttendanceTable students={students} />
            <div className="student-cards">
                {students.map(student => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>
        </div>
    );
};

export default Students;