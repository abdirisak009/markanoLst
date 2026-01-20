-- ====================================================
-- Interactive Gamified Learning Path - Database Schema
-- ====================================================
-- Production-ready schema for gamified learning system
-- Supports: Courses → Modules → Lessons → Quizzes/Tasks
-- Gamification: XP, Levels, Badges, Daily Streaks
-- ====================================================

-- ====================================================
-- 1. COURSES TABLE
-- ====================================================
-- Main course container. Each course has multiple modules.
CREATE TABLE IF NOT EXISTS learning_courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    instructor_name VARCHAR(255),
    estimated_duration_minutes INTEGER DEFAULT 0,
    difficulty_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    price DECIMAL(10, 2) DEFAULT 0.00, -- Course price in dollars
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_courses_slug ON learning_courses(slug);
CREATE INDEX idx_learning_courses_active ON learning_courses(is_active);
CREATE INDEX idx_learning_courses_order ON learning_courses(order_index);
CREATE INDEX idx_learning_courses_price ON learning_courses(price);

-- ====================================================
-- 2. MODULES TABLE
-- ====================================================
-- Modules within courses. Lessons are organized in modules.
CREATE TABLE IF NOT EXISTS learning_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, order_index)
);

CREATE INDEX idx_learning_modules_course ON learning_modules(course_id);
CREATE INDEX idx_learning_modules_order ON learning_modules(course_id, order_index);

-- ====================================================
-- 3. LESSONS TABLE
-- ====================================================
-- Individual lessons within modules. Sequential unlocking.
CREATE TABLE IF NOT EXISTS learning_lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500), -- YouTube, Vimeo, or direct video URL
    video_duration_seconds INTEGER DEFAULT 0,
    lesson_type VARCHAR(50) DEFAULT 'video', -- video, reading, interactive
    order_index INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 10, -- XP points for completing this lesson
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, order_index)
);

CREATE INDEX idx_learning_lessons_module ON learning_lessons(module_id);
CREATE INDEX idx_learning_lessons_order ON learning_lessons(module_id, order_index);

-- ====================================================
-- 4. LESSON QUIZZES TABLE
-- ====================================================
-- Quick quizzes (1-3 questions) per lesson for engagement.
CREATE TABLE IF NOT EXISTS lesson_quizzes (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    options JSONB, -- For multiple choice: ["Option A", "Option B", "Option C"]
    correct_answer TEXT NOT NULL, -- Answer or answer key
    explanation TEXT, -- Why this answer is correct/incorrect
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_quizzes_lesson ON lesson_quizzes(lesson_id);

-- ====================================================
-- 5. LESSON TASKS TABLE
-- ====================================================
-- Mini tasks or reflection prompts after lesson.
CREATE TABLE IF NOT EXISTS lesson_tasks (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
    task_type VARCHAR(50) DEFAULT 'reflection', -- reflection, practice, submission
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    expected_output TEXT, -- Optional: what we expect
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_tasks_lesson ON lesson_tasks(lesson_id);

-- ====================================================
-- 6. USER LESSON PROGRESS TABLE
-- ====================================================
-- Tracks individual lesson completion and quiz/task status.
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- References your existing users/students table
    lesson_id INTEGER NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
    video_watched BOOLEAN DEFAULT false,
    video_progress_percentage INTEGER DEFAULT 0, -- 0-100
    quiz_completed BOOLEAN DEFAULT false,
    quiz_score INTEGER DEFAULT 0, -- Percentage score
    task_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(user_id, status);

-- ====================================================
-- 7. USER COURSE PROGRESS TABLE
-- ====================================================
-- Aggregated course-level progress tracking.
CREATE TABLE IF NOT EXISTS user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0, -- 0-100
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    current_lesson_id INTEGER REFERENCES learning_lessons(id), -- Next lesson to continue
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course ON user_course_progress(course_id);

-- ====================================================
-- 8. USER XP TABLE
-- ====================================================
-- Tracks XP points earned by users (gamification).
CREATE TABLE IF NOT EXISTS user_xp (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    xp_amount INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- lesson_completion, quiz_perfect, daily_streak, badge
    source_id INTEGER, -- ID of the source (lesson_id, badge_id, etc.)
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_user_xp_earned ON user_xp(user_id, earned_at);

-- ====================================================
-- 9. USER XP SUMMARY TABLE
-- ====================================================
-- Aggregated XP for quick level calculation.
CREATE TABLE IF NOT EXISTS user_xp_summary (
    user_id INTEGER PRIMARY KEY,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 100,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- 10. LEVELS TABLE
-- ====================================================
-- Level definitions (XP thresholds).
CREATE TABLE IF NOT EXISTS learning_levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER UNIQUE NOT NULL,
    level_name VARCHAR(100) NOT NULL, -- e.g., "Beginner", "Explorer", "Master"
    xp_required INTEGER NOT NULL,
    badge_icon VARCHAR(255), -- Icon/emoji for level
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_levels_number ON learning_levels(level_number);
CREATE INDEX idx_learning_levels_xp ON learning_levels(xp_required);

-- Insert default levels
INSERT INTO learning_levels (level_number, level_name, xp_required, badge_icon, description) VALUES
(1, 'Beginner', 0, '🌱', 'Just starting your journey'),
(2, 'Explorer', 100, '🔍', 'Exploring new concepts'),
(3, 'Learner', 250, '📚', 'Building knowledge'),
(4, 'Student', 500, '🎓', 'Dedicated student'),
(5, 'Scholar', 1000, '📖', 'Deep understanding'),
(6, 'Expert', 2000, '⭐', 'Expert level'),
(7, 'Master', 4000, '👑', 'Master of learning'),
(8, 'Legend', 8000, '🏆', 'Learning legend')
ON CONFLICT (level_number) DO NOTHING;

-- ====================================================
-- 11. BADGES TABLE
-- ====================================================
-- Badge definitions for milestones.
CREATE TABLE IF NOT EXISTS learning_badges (
    id SERIAL PRIMARY KEY,
    badge_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., "first_lesson", "week_streak"
    badge_name VARCHAR(255) NOT NULL,
    badge_icon VARCHAR(255) NOT NULL, -- Emoji or icon URL
    description TEXT,
    badge_type VARCHAR(50) DEFAULT 'milestone', -- milestone, streak, achievement
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_badges_key ON learning_badges(badge_key);

-- Insert default badges
INSERT INTO learning_badges (badge_key, badge_name, badge_icon, description, badge_type, xp_reward) VALUES
('first_lesson', 'First Steps', '🎯', 'Completed your first lesson', 'milestone', 25),
('first_module', 'Module Master', '📦', 'Completed your first module', 'milestone', 50),
('first_course', 'Course Complete', '🎓', 'Completed your first course', 'milestone', 100),
('week_streak', 'Week Warrior', '🔥', '7 day learning streak', 'streak', 75),
('month_streak', 'Monthly Master', '💪', '30 day learning streak', 'streak', 200),
('quiz_master', 'Quiz Master', '🧠', 'Perfect quiz scores', 'achievement', 75),
('speed_learner', 'Speed Learner', '⚡', 'Completed 10 lessons in a day', 'achievement', 100)
ON CONFLICT (badge_key) DO NOTHING;

-- ====================================================
-- 12. USER BADGES TABLE
-- ====================================================
-- Tracks badges earned by users.
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL REFERENCES learning_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- ====================================================
-- 13. DAILY STREAKS TABLE
-- ====================================================
-- Tracks daily learning streaks for motivation.
CREATE TABLE IF NOT EXISTS daily_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    streak_date DATE NOT NULL,
    lessons_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, streak_date)
);

CREATE INDEX idx_daily_streaks_user ON daily_streaks(user_id);
CREATE INDEX idx_daily_streaks_date ON daily_streaks(user_id, streak_date DESC);

-- ====================================================
-- 14. QUIZ SUBMISSIONS TABLE
-- ====================================================
-- Stores user quiz answers for review and feedback.
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL REFERENCES lesson_quizzes(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quiz_id)
);

CREATE INDEX idx_quiz_submissions_user ON quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz ON quiz_submissions(quiz_id);

-- ====================================================
-- 15. TASK SUBMISSIONS TABLE
-- ====================================================
-- Stores user task submissions (reflections, practice).
CREATE TABLE IF NOT EXISTS task_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL REFERENCES lesson_tasks(id) ON DELETE CASCADE,
    submission_content TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id)
);

CREATE INDEX idx_task_submissions_user ON task_submissions(user_id);
CREATE INDEX idx_task_submissions_task ON task_submissions(task_id);

-- ====================================================
-- COMMENTS & DOCUMENTATION
-- ====================================================
COMMENT ON TABLE learning_courses IS 'Main course container. Each course has multiple modules.';
COMMENT ON TABLE learning_modules IS 'Modules within courses. Lessons are organized in modules.';
COMMENT ON TABLE learning_lessons IS 'Individual lessons within modules. Sequential unlocking.';
COMMENT ON TABLE lesson_quizzes IS 'Quick quizzes (1-3 questions) per lesson for engagement.';
COMMENT ON TABLE lesson_tasks IS 'Mini tasks or reflection prompts after lesson.';
COMMENT ON TABLE user_lesson_progress IS 'Tracks individual lesson completion and quiz/task status.';
COMMENT ON TABLE user_course_progress IS 'Aggregated course-level progress tracking.';
COMMENT ON TABLE user_xp IS 'Tracks XP points earned by users (gamification).';
COMMENT ON TABLE user_xp_summary IS 'Aggregated XP for quick level calculation.';
COMMENT ON TABLE learning_levels IS 'Level definitions (XP thresholds).';
COMMENT ON TABLE learning_badges IS 'Badge definitions for milestones.';
COMMENT ON TABLE user_badges IS 'Tracks badges earned by users.';
COMMENT ON TABLE daily_streaks IS 'Tracks daily learning streaks for motivation.';
COMMENT ON TABLE quiz_submissions IS 'Stores user quiz answers for review and feedback.';
COMMENT ON TABLE task_submissions IS 'Stores user task submissions (reflections, practice).';
