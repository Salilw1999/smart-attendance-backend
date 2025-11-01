------------------------------------------------------------
-- USERS TABLE
------------------------------------------------------------
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

-- Default admin user (password: admin)
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
-- CLASSES TABLE
------------------------------------------------------------
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

------------------------------------------------------------
-- CLASSROOMS TABLE (Linked to classes)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, class_id) -- Prevent duplicate room names within same class
);

-- Insert sample classrooms linked to classes
INSERT INTO classrooms (name, location, class_id)
VALUES
    ('Room A', 'First Floor', 1),
    ('Room B', 'First Floor', 1),
    ('Room C', 'Second Floor', 2),
    ('Room D', 'Second Floor', 3)
ON CONFLICT (name, class_id) DO NOTHING;

------------------------------------------------------------
-- STUDENTS TABLE
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

------------------------------------------------------------
-- SAMPLE STUDENTS
------------------------------------------------------------
INSERT INTO students (name, unique_number, class_id, classroom_id, parent_contact, parent_email, contact_number, blood_group)
VALUES
('Rohit Sharma', 'STU001', 1, 1, '9999988888', 'parent1@example.com', '8888899999', 'O+'),
('Priya Singh', 'STU002', 2, 3, '7777766666', 'parent2@example.com', '6666677777', 'A+')
ON CONFLICT (unique_number) DO NOTHING;

ALTER TABLE students ADD COLUMN class_name VARCHAR;
ALTER TABLE students ADD COLUMN classroom_name VARCHAR;