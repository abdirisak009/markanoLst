-- Create course_payments table for tracking course payments
CREATE TABLE IF NOT EXISTS course_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery', -- cash_on_delivery, online, etc.
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX idx_course_payments_user ON course_payments(user_id);
CREATE INDEX idx_course_payments_course ON course_payments(course_id);
CREATE INDEX idx_course_payments_status ON course_payments(status);
