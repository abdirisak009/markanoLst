-- Create Universities table
CREATE TABLE IF NOT EXISTS universities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'penn' or 'university'
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  duration VARCHAR(50),
  thumbnail VARCHAR(500),
  rating DECIMAL(3,2),
  students_count INTEGER DEFAULT 0,
  type VARCHAR(50), -- 'penn' or 'university'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Modules table
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(50),
  video_url TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Penn Students table
CREATE TABLE IF NOT EXISTS penn_students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  phone VARCHAR(50),
  selected_course VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create University Students table
CREATE TABLE IF NOT EXISTS university_students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,
  class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'disabled'
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student Progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  student_type VARCHAR(50) NOT NULL, -- 'penn' or 'university'
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  watch_time INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, lesson_id)
);

-- Create Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  period VARCHAR(50), -- 'regular', 'midterm', 'final'
  max_marks INTEGER NOT NULL,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Student Marks table
CREATE TABLE IF NOT EXISTS student_marks (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(5),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, assignment_id)
);

-- Create Videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  duration VARCHAR(50),
  category VARCHAR(100),
  views INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_university ON classes(university_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_course ON student_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_student ON student_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_assignment ON student_marks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_university_students_university ON university_students(university_id);
CREATE INDEX IF NOT EXISTS idx_university_students_class ON university_students(class_id);
