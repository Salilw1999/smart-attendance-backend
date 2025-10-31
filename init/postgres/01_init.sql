-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user with default password 'admin'
INSERT INTO users (username, email, full_name, hashed_password, is_active, is_superuser)
VALUES (
    'admin',
    'admin@example.com',
    'Administrator',
    '$2b$12$Zj5RPSAsv3c5DZC.IFD14.lQsKM.oKv5rca5jfZ0PV1M7hIDZyITm', -- hashed 'admin'
    true,
    true
) ON CONFLICT (username) DO NOTHING;

------------------------------------------------------------
-- CLASS & CLASSROOM TABLES
------------------------------------------------------------

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample classes
INSERT INTO classes (name)
VALUES 
    ('1st'),
    ('2nd'),
    ('3rd'),
    ('4th'),
    ('5th'),
    ('6th'),
    ('7th'),
    ('8th'),
    ('9th'),
    ('10th')
ON CONFLICT (name) DO NOTHING;

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample classrooms
INSERT INTO classrooms (name, location)
VALUES
    ('Room A', 'First Floor'),
    ('Room B', 'First Floor'),
    ('Room C', 'Second Floor'),
    ('Room D', 'Second Floor')
ON CONFLICT (name) DO NOTHING;

------------------------------------------------------------
-- STUDENTS TABLE (linked to class + classroom)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unique_number VARCHAR(50) UNIQUE NOT NULL,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE SET NULL,
    parent_contact VARCHAR(20),
    parent_email VARCHAR(255),
    contact_number VARCHAR(20),
    blood_group VARCHAR(10),
    photo_url VARCHAR(255),
    face_embedding JSON,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON students(classroom_id);

------------------------------------------------------------
-- ATTENDANCE TABLE
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    captured_photo_url VARCHAR(255),
    confidence_score FLOAT
);

-- Indexes for Attendance Table
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

------------------------------------------------------------
-- SAMPLE STUDENT DATA (optional)
------------------------------------------------------------
INSERT INTO students (name, unique_number, class_id, classroom_id, parent_contact, parent_email, contact_number, blood_group)
VALUES
('Rohit Sharma', 'STU001', 1, 1, '9999988888', 'parent1@example.com', '8888899999', 'O+'),
('Priya Singh', 'STU002', 2, 2, '7777766666', 'parent2@example.com', '6666677777', 'A+')
ON CONFLICT (unique_number) DO NOTHING;
