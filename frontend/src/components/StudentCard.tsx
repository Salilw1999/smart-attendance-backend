import React from 'react';
import { Student } from '../interfaces/types';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  return (
    <div className="student-card">
      {student.avatar && <img src={student.avatar} alt={student.name} />}
      <h3>{student.name}</h3>
      {student.rollNumber && <p>Roll No: {student.rollNumber}</p>}
    </div>
  );
};

export default StudentCard;
