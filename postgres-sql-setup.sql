-- database.sql
-- Schema for Smart Attendance Project

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    roll_no VARCHAR(100) UNIQUE NOT NULL,
    classroom VARCHAR(100) NOT NULL,
    family_contact VARCHAR(100),
    image_object VARCHAR(512) NOT NULL,
    image_url_cached VARCHAR(1024),
    extra JSON DEFAULT '{}'::json,
    face_encoding JSON,  -- ✅ master face encoding reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status attendance_status NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    note VARCHAR(255),
    evidence_object VARCHAR(512),
    face_encoding JSON   -- ✅ optional encoding per attendance
);

-- Indexes for performance
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_at ON attendance(at);
