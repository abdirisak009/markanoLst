-- ====================================================
-- Reviews (Student / Instructor testimonials)
-- ====================================================
-- Students and instructors can submit reviews with:
-- name, company, avatar, message (limited), course, star rating.
-- Admin can approve/reject/delete.
-- ====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    message TEXT NOT NULL,
    course_id INTEGER REFERENCES learning_courses(id) ON DELETE SET NULL,
    course_title VARCHAR(255) DEFAULT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewer_type VARCHAR(50) DEFAULT 'student', -- 'student' | 'instructor'
    status VARCHAR(50) DEFAULT 'pending',        -- 'pending' | 'approved' | 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
