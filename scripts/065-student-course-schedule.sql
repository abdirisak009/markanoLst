-- ====================================================
-- Student course schedule: jadwal barashada koorsada
-- Arday markuu "Start learning" ugu bixin koorsada waa inuu dhigaa:
--   - Inta saac isbuuc uu ku dahmeen karo
--   - Maalmaha isbuuca (Mon–Sun) oo mid walba wakhti (sascada)
-- Xasuusin 1 saac kahor + fariin "maanta waad ka baaqday" hadii uu maanta so galin.
-- ====================================================

-- 1. Jadwalka koorsada (student_id = gold_students.id, course_id = learning_courses.id)
CREATE TABLE IF NOT EXISTS student_course_schedule (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week >= 1 AND hours_per_week <= 168),
    -- Maalmaha + wakhtiga: mon, tue, wed, thu, fri, sat, sun; qiime waa "HH:MM" ama null hadii maalinta laga reebay
    schedule JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

COMMENT ON TABLE student_course_schedule IS 'Jadwal barashada: inta saac isbuuc, maalmaha iyo sascada maalin walba';
CREATE INDEX IF NOT EXISTS idx_student_course_schedule_student ON student_course_schedule(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_schedule_course ON student_course_schedule(course_id);

-- 2. Xasuusin 1 saac kahor: lagu track gareeyo marka la diray WhatsApp
CREATE TABLE IF NOT EXISTS schedule_reminder_sent (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, scheduled_date, scheduled_time)
);

COMMENT ON TABLE schedule_reminder_sent IS '1 saac kahor cashirka: WhatsApp xasuusin la diray';
CREATE INDEX IF NOT EXISTS idx_schedule_reminder_sent_date ON schedule_reminder_sent(scheduled_date, scheduled_time);

-- 3. Fariin "maanta cashirkaad ka baaqday" (maanta so galin / no activity)
CREATE TABLE IF NOT EXISTS missed_lesson_whatsapp_sent (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES gold_students(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
    lesson_date DATE NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, lesson_date)
);

COMMENT ON TABLE missed_lesson_whatsapp_sent IS 'Maanta cashirka lahaa laakiin so galin: WhatsApp "waad ka baaqday" la diray';
CREATE INDEX IF NOT EXISTS idx_missed_lesson_sent_date ON missed_lesson_whatsapp_sent(lesson_date);
//kasfjdak
//jflk
//ssss