------------------------------------------------------------
-- USERS TABLE
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    role_id INTEGER, -- ✅ Added for RBAC linkage
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

------------------------------------------------------------
-- ROLES TABLE
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default roles
INSERT INTO roles (name, description)
VALUES 
    ('admin', 'Full system access'),
    ('teacher', 'Limited to attendance and student data'),
    ('viewer', 'Read-only dashboard access')
ON CONFLICT (name) DO NOTHING;

------------------------------------------------------------
-- PERMISSIONS TABLE
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(100) NOT NULL, -- e.g. "students", "attendance"
    can_view BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    UNIQUE (role_id, module)
);

-- Sample default permissions
INSERT INTO permissions (role_id, module, can_view, can_edit, can_delete)
SELECT id, 'students', TRUE, TRUE, TRUE FROM roles WHERE name='admin'
ON CONFLICT DO NOTHING;

INSERT INTO permissions (role_id, module, can_view, can_edit, can_delete)
SELECT id, 'attendance', TRUE, TRUE, TRUE FROM roles WHERE name='admin'
ON CONFLICT DO NOTHING;

INSERT INTO permissions (role_id, module, can_view, can_edit, can_delete)
SELECT id, 'students', TRUE, FALSE, FALSE FROM roles WHERE name='teacher'
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- FOREIGN KEY LINK: users → roles
------------------------------------------------------------
ALTER TABLE users
ADD CONSTRAINT IF NOT EXISTS fk_users_role_id
FOREIGN KEY (role_id) REFERENCES roles (id)
ON DELETE SET NULL;

------------------------------------------------------------
-- DEFAULT ADMIN USER
------------------------------------------------------------
INSERT INTO users (username, email, full_name, hashed_password, is_active, is_superuser, role_id)
SELECT 
    'admin',
    'admin@example.com',
    'Administrator',
    '$2b$12$Zj5RPSAsv3c5DZC.IFD14.lQsKM.oKv5rca5jfZ0PV1M7hIDZyITm', -- hashed 'admin'
    TRUE,
    TRUE,
    id
FROM roles WHERE name='admin'
ON CONFLICT (username) DO NOTHING;

------------------------------------------------------------
-- CLASSES TABLE
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO classes (name)
VALUES 
    ('1st'), ('2nd'), ('3rd'), ('4th'), ('5th'),
    ('6th'), ('7th'), ('8th'), ('9th'), ('10th')
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
    UNIQUE (name, class_id)
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    class_name VARCHAR,
    classroom_name VARCHAR
);

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
    confidence_score FLOAT,
    class_name VARCHAR,
    classroom_name VARCHAR,
    time VARCHAR
);

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


