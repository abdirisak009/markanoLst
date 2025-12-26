-- Markano Gold LMS Database Schema
-- ================================

-- 1. GOLD STUDENTS TABLE (Student accounts for Markano Gold)
CREATE TABLE IF NOT EXISTS gold_students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    field_of_study VARCHAR(255),
    profile_image VARCHAR(500),
    account_status VARCHAR(50) DEFAULT 'pending', -- pending, active, suspended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. GOLD TRACKS TABLE (Learning Paths)
CREATE TABLE IF NOT EXISTS gold_tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Icon name for display
    color VARCHAR(50), -- Track color theme
    estimated_duration VARCHAR(100), -- e.g., "3 months"
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. GOLD LEVELS TABLE (Levels within Tracks)
CREATE TABLE IF NOT EXISTS gold_levels (
    id SERIAL PRIMARY KEY,
    track_id INTEGER REFERENCES gold_tracks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL, -- Level order (1, 2, 3, 4...)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. GOLD LESSONS TABLE (Multi-content type lessons)
CREATE TABLE IF NOT EXISTS gold_lessons (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    lesson_type VARCHAR(50) NOT NULL, -- text, documentation, video
    content TEXT, -- For text/documentation lessons
    video_url VARCHAR(500), -- For video lessons
    video_duration INTEGER, -- Duration in seconds
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. GOLD EXERCISES TABLE (Level exercises/tasks)
CREATE TABLE IF NOT EXISTS gold_exercises (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    submission_type VARCHAR(50) DEFAULT 'file', -- file, link, text
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. GOLD TRACK APPLICATIONS (Student applications to tracks)
CREATE TABLE IF NOT EXISTS gold_track_applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES gold_tracks(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER, -- Admin user ID
    rejection_reason TEXT,
    UNIQUE(student_id, track_id)
);

-- 7. GOLD ENROLLMENTS (Approved track enrollments)
CREATE TABLE IF NOT EXISTS gold_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES gold_tracks(id) ON DELETE CASCADE,
    current_level_id INTEGER REFERENCES gold_levels(id),
    enrollment_status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, track_id)
);

-- 8. GOLD LEVEL PROGRESS (Student progress through levels)
CREATE TABLE IF NOT EXISTS gold_level_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'locked', -- locked, unlocked, in_progress, completed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, level_id)
);

-- 9. GOLD LESSON PROGRESS (Detailed lesson tracking)
CREATE TABLE IF NOT EXISTS gold_lesson_progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES gold_lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
    progress_percentage INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0, -- For videos, in seconds
    last_position INTEGER DEFAULT 0, -- Video position in seconds
    last_accessed_at TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, lesson_id)
);

-- 10. GOLD EXERCISE SUBMISSIONS (Student submissions)
CREATE TABLE IF NOT EXISTS gold_exercise_submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES gold_exercises(id) ON DELETE CASCADE,
    submission_content TEXT, -- File URL, link, or text content
    submission_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    feedback TEXT,
    grade VARCHAR(10) -- Optional grade
);

-- 11. GOLD LEVEL REQUESTS (Student requests for next level)
CREATE TABLE IF NOT EXISTS gold_level_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    current_level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE,
    next_level_id INTEGER REFERENCES gold_levels(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    rejection_reason TEXT
);

-- 12. GOLD STUDENT ACTIVITY LOG (Detailed activity tracking)
CREATE TABLE IF NOT EXISTS gold_student_activity (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES gold_students(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- login, lesson_view, video_watch, submission, etc.
    entity_type VARCHAR(50), -- track, level, lesson, exercise
    entity_id INTEGER,
    metadata JSONB, -- Additional activity data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gold_enrollments_student ON gold_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_gold_enrollments_track ON gold_enrollments(track_id);
CREATE INDEX IF NOT EXISTS idx_gold_level_progress_student ON gold_level_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_gold_lesson_progress_student ON gold_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_gold_applications_status ON gold_track_applications(status);
CREATE INDEX IF NOT EXISTS idx_gold_student_activity_student ON gold_student_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_gold_student_activity_created ON gold_student_activity(created_at);
