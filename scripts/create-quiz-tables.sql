-- =====================================================
-- QUIZ MANAGEMENT SYSTEM - DATABASE TABLES
-- =====================================================

-- 1. QUIZZES TABLE - Main quiz information
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,
    created_by VARCHAR(100),
    time_limit INTEGER, -- in minutes, NULL means no limit
    passing_score INTEGER DEFAULT 60, -- percentage to pass
    max_attempts INTEGER DEFAULT 1, -- how many times student can take
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_options BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true, -- show results after submission
    show_correct_answers BOOLEAN DEFAULT false, -- show correct answers after
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, closed
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    access_code VARCHAR(50), -- unique code for sharing quiz link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(30) NOT NULL, -- 'multiple_choice', 'true_false', 'direct', 'fill_blank', 'matching'
    question_text TEXT NOT NULL,
    question_image TEXT, -- optional image URL
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    explanation TEXT, -- explanation shown after answering
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. QUIZ OPTIONS TABLE - For multiple choice and matching questions
CREATE TABLE IF NOT EXISTS quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_image TEXT, -- optional image
    is_correct BOOLEAN DEFAULT false,
    match_pair TEXT, -- for matching questions, the paired item
    order_index INTEGER DEFAULT 0
);

-- 4. QUIZ ATTEMPTS TABLE - Student quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id VARCHAR(100) NOT NULL,
    student_type VARCHAR(30) DEFAULT 'university', -- 'penn' or 'university'
    student_phone VARCHAR(20),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_spent INTEGER, -- in seconds
    score NUMERIC(5,2),
    total_points INTEGER,
    percentage NUMERIC(5,2),
    passed BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'in_progress' -- 'in_progress', 'submitted', 'graded'
);

-- 5. QUIZ ANSWERS TABLE - Student answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES quiz_options(id) ON DELETE SET NULL,
    answer_text TEXT, -- for direct/fill_blank questions
    matching_answers JSONB, -- for matching questions [{left: id, right: id}]
    is_correct BOOLEAN,
    points_earned NUMERIC(5,2) DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_access_code ON quizzes(access_code);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);

-- Generate unique access codes for quizzes
CREATE OR REPLACE FUNCTION generate_quiz_access_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.access_code IS NULL THEN
        NEW.access_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quiz_access_code
    BEFORE INSERT ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quiz_access_code();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_quiz_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_timestamp();
