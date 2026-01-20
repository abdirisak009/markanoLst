# 📚 Learning System - Complete Setup Guide

## 🎯 Overview

This document explains the complete learning system setup, database schema, and how everything works together.

---

## 🗄️ Database Schema

### Main Script: `045-gamified-learning-path-schema.sql`

This script creates **15 tables** for the complete learning system:

1. **learning_courses** - Course catalog
2. **learning_modules** - Modules within courses
3. **learning_lessons** - Individual lessons
4. **lesson_quizzes** - Quiz questions per lesson
5. **lesson_tasks** - Tasks/reflections per lesson
6. **user_lesson_progress** - Individual lesson progress
7. **user_course_progress** - Course-level progress
8. **user_xp** - XP transaction log
9. **user_xp_summary** - Aggregated XP for levels
10. **learning_levels** - Level definitions (8 levels)
11. **learning_badges** - Badge definitions (7 badges)
12. **user_badges** - Earned badges
13. **daily_streaks** - Daily activity tracking
14. **quiz_submissions** - Quiz answers
15. **task_submissions** - Task submissions

---

## 🚀 Setup Instructions

### Step 1: Run Main Schema

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL -f scripts/045-gamified-learning-path-schema.sql
```

This creates:
- ✅ All 15 tables with proper relationships
- ✅ Indexes for performance
- ✅ Default levels (Beginner → Legend)
- ✅ Default badges (7 badges)
- ✅ **Price column** included in courses table

### Step 2: Verify Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'learning_%' OR table_name LIKE 'lesson_%' OR table_name LIKE 'user_%' OR table_name LIKE 'daily_%' OR table_name LIKE 'quiz_%' OR table_name LIKE 'task_%';

-- Check levels were created
SELECT * FROM learning_levels ORDER BY level_number;

-- Check badges were created
SELECT * FROM learning_badges;
```

---

## 📊 Table Structure & Relationships

### Course Hierarchy

```
learning_courses (1)
    ↓
learning_modules (many)
    ↓
learning_lessons (many)
    ↓
lesson_quizzes (many) + lesson_tasks (many)
```

### Progress Tracking

```
user_course_progress (1 per course per user)
    ↓
user_lesson_progress (1 per lesson per user)
    ↓
quiz_submissions + task_submissions
```

### Gamification

```
user_xp (transaction log)
    ↓
user_xp_summary (aggregated)
    ↓
learning_levels (definitions)
    ↓
user_badges (earned)
    ↓
daily_streaks (activity)
```

---

## 🔄 How It Works

### 1. Course Creation Flow

**Admin creates course:**
```
POST /api/learning/courses
  ↓
INSERT INTO learning_courses (title, slug, description, price, ...)
  ↓
Course created with price = 0.00 (default)
```

**Course Fields:**
- `title` - Course name
- `slug` - URL-friendly identifier
- `description` - Course description
- `price` - Course price (DECIMAL 10,2)
- `instructor_name` - Instructor
- `estimated_duration_minutes` - Total duration
- `difficulty_level` - beginner/intermediate/advanced
- `is_active` - Visible to students
- `is_featured` - Show prominently
- `order_index` - Display order

### 2. Module Creation Flow

**Admin creates module:**
```
POST /api/learning/modules
  ↓
INSERT INTO learning_modules (course_id, title, description, order_index)
  ↓
Module created, linked to course
```

**Module Fields:**
- `course_id` - Foreign key to course
- `title` - Module name
- `description` - Module description
- `order_index` - Order within course (UNIQUE per course)
- `is_active` - Active status

### 3. Lesson Creation Flow

**Admin creates lesson:**
```
POST /api/learning/lessons
  ↓
INSERT INTO learning_lessons (module_id, title, video_url, xp_reward, ...)
  ↓
Lesson created, linked to module
```

**Lesson Fields:**
- `module_id` - Foreign key to module
- `title` - Lesson name
- `description` - Lesson description
- `video_url` - Video URL (YouTube, Vimeo, etc.)
- `video_duration_seconds` - Video length
- `lesson_type` - video/reading/interactive
- `order_index` - Order within module (UNIQUE per module)
- `xp_reward` - XP points for completion (default: 10)
- `is_active` - Active status

### 4. Quiz Creation Flow

**Admin creates quiz:**
```
POST /api/learning/quizzes
  ↓
INSERT INTO lesson_quizzes (lesson_id, question, question_type, options, correct_answer, ...)
  ↓
Quiz created, linked to lesson
```

**Quiz Fields:**
- `lesson_id` - Foreign key to lesson
- `question` - Question text
- `question_type` - multiple_choice/true_false/short_answer
- `options` - JSONB array for multiple choice: `["Option A", "Option B", "Option C"]`
- `correct_answer` - Correct answer text
- `explanation` - Why answer is correct
- `order_index` - Order within lesson

**Example Multiple Choice:**
```json
{
  "question": "What is JavaScript?",
  "question_type": "multiple_choice",
  "options": ["A programming language", "A database", "A framework"],
  "correct_answer": "A programming language",
  "explanation": "JavaScript is a programming language used for web development"
}
```

### 5. Task Creation Flow

**Admin creates task:**
```
POST /api/learning/tasks
  ↓
INSERT INTO lesson_tasks (lesson_id, task_type, title, instructions, ...)
  ↓
Task created, linked to lesson
```

**Task Fields:**
- `lesson_id` - Foreign key to lesson
- `task_type` - reflection/practice/submission
- `title` - Task title
- `instructions` - What student should do
- `expected_output` - Optional: what we expect
- `is_required` - Must complete to finish lesson

---

## 🎮 Student Enrollment & Progress

### Enrollment Flow

```
Student clicks "Enroll"
  ↓
POST /api/learning/enroll
  ↓
INSERT INTO user_course_progress (user_id, course_id, ...)
  ↓
First lesson unlocked in user_lesson_progress
  ↓
Student can start learning
```

### Lesson Completion Flow

```
Student watches video
  ↓
POST /api/learning/progress (video_watched: true)
  ↓
Student completes quiz
  ↓
POST /api/learning/quiz/submit
  ↓
Student submits task
  ↓
POST /api/learning/task/submit
  ↓
Lesson marked as completed
  ↓
XP awarded → Level updated → Badges checked → Next lesson unlocked
```

### XP & Level System

**XP Sources:**
- Lesson completion: 10 XP (default, configurable per lesson)
- Perfect quiz: +5 XP bonus
- Badge earned: 25-200 XP (varies by badge)
- Daily streak: Tracked (no direct XP)

**Level Calculation:**
```
Total XP calculated from user_xp table
  ↓
Find highest level where xp_required <= total_xp
  ↓
Update user_xp_summary
  ↓
Calculate XP to next level
```

**8 Pre-defined Levels:**
1. Beginner (0 XP) 🌱
2. Explorer (100 XP) 🔍
3. Learner (250 XP) 📚
4. Student (500 XP) 🎓
5. Scholar (1000 XP) 📖
6. Expert (2000 XP) ⭐
7. Master (4000 XP) 👑
8. Legend (8000 XP) 🏆

---

## 🔐 Security & Access

### Admin Access

**Protected Routes:**
- `/api/learning/courses` (POST, PUT, DELETE)
- `/api/learning/modules` (POST, PUT, DELETE)
- `/api/learning/lessons` (POST, PUT, DELETE)
- `/api/learning/quizzes` (POST, PUT, DELETE)
- `/api/learning/tasks` (POST, PUT, DELETE)

**Authentication:**
- Admin session cookie required
- Checked in `proxy.ts` middleware

### Student Access

**Public Routes:**
- `/api/learning/courses` (GET) - View courses
- `/api/learning/courses/[id]` (GET) - View course details
- `/api/learning/lessons/[id]` (GET) - View lesson (if unlocked)
- `/api/learning/enroll` (POST) - Enroll in course
- `/api/learning/progress` (POST) - Update progress
- `/api/learning/quiz/submit` (POST) - Submit quiz
- `/api/learning/task/submit` (POST) - Submit task

---

## 📝 Admin Workflow

### Creating a Complete Course

1. **Create Course**
   - Go to `/admin/learning-courses`
   - Click "Create Course"
   - Fill: Title, Slug, Description, Price, Instructor, Duration, Difficulty
   - Set Featured/Active toggles
   - Click "Create Course"

2. **Add Modules**
   - Click "Manage" on course card
   - Click "Add Module"
   - Enter: Title, Description, Order Index
   - Click "Create"

3. **Add Lessons**
   - Expand module
   - Click "Add Lesson"
   - Enter: Title, Description, Video URL, Duration, XP Reward
   - Select Lesson Type
   - Click "Create"

4. **Add Quizzes**
   - Expand lesson
   - Click "Quiz" button
   - Enter: Question, Type, Options (if multiple choice), Correct Answer, Explanation
   - Click "Create"

5. **Add Tasks**
   - Expand lesson
   - Click "Task" button
   - Enter: Title, Instructions, Expected Output (optional)
   - Select Task Type
   - Set Required toggle
   - Click "Create"

---

## 🎯 Key Features

### Sequential Unlocking

**Rules:**
- First lesson of first module: Always unlocked
- Other lessons: Previous lesson must be `completed`
- Cross-module: Last lesson of previous module must be completed

**Implementation:**
- Checked in `GET /api/learning/lessons/[lessonId]`
- Returns `is_unlocked: true/false`

### Progress Tracking

**Three Levels:**
1. **Lesson Progress:** Individual lesson status
2. **Module Progress:** Calculated from lessons
3. **Course Progress:** Aggregated percentage

**Auto-updates:**
- Course progress recalculated on lesson completion
- Current lesson ID updated automatically
- Progress: `(completed / total) * 100`

### Gamification

**XP Award Flow:**
```
Lesson Completed
  ↓
Award XP (stored in user_xp)
  ↓
Update user_xp_summary.total_xp
  ↓
Recalculate level
  ↓
Check badge eligibility
  ↓
Award badges (if eligible)
  ↓
Update daily streak
```

**Badge Auto-awarding:**
- `first_lesson` - After first lesson
- `first_module` - After first module
- `first_course` - After first course
- `week_streak` - After 7 days
- `month_streak` - After 30 days
- `quiz_master` - Perfect quiz scores
- `speed_learner` - 10 lessons in one day

---

## 🔧 API Endpoints Reference

### Courses

- `GET /api/learning/courses?userId={id}` - Get all courses with progress
- `GET /api/learning/courses/[courseId]?userId={id}` - Get course details
- `POST /api/learning/courses` - Create course (admin)
- `PUT /api/learning/courses/[courseId]` - Update course (admin)
- `DELETE /api/learning/courses/[courseId]` - Delete course (admin)

### Modules

- `GET /api/learning/modules?courseId={id}` - Get modules for course
- `POST /api/learning/modules` - Create module (admin)
- `PUT /api/learning/modules` - Update module (admin)
- `DELETE /api/learning/modules?id={id}` - Delete module (admin)

### Lessons

- `GET /api/learning/lessons?moduleId={id}` - Get lessons for module
- `GET /api/learning/lessons/[lessonId]?userId={id}` - Get lesson details
- `POST /api/learning/lessons` - Create lesson (admin)
- `PUT /api/learning/lessons` - Update lesson (admin)
- `DELETE /api/learning/lessons?id={id}` - Delete lesson (admin)

### Quizzes

- `GET /api/learning/quizzes?lessonId={id}` - Get quizzes for lesson
- `POST /api/learning/quizzes` - Create quiz (admin)
- `PUT /api/learning/quizzes` - Update quiz (admin)
- `DELETE /api/learning/quizzes?id={id}` - Delete quiz (admin)
- `POST /api/learning/quiz/submit` - Submit quiz answer (student)

### Tasks

- `GET /api/learning/tasks?lessonId={id}` - Get tasks for lesson
- `POST /api/learning/tasks` - Create task (admin)
- `PUT /api/learning/tasks` - Update task (admin)
- `DELETE /api/learning/tasks?id={id}` - Delete task (admin)
- `POST /api/learning/task/submit` - Submit task (student)

### Enrollment & Progress

- `POST /api/learning/enroll` - Enroll in course
- `POST /api/learning/progress` - Update lesson progress

### Gamification

- `GET /api/learning/gamification/xp?userId={id}` - Get XP & level
- `GET /api/learning/gamification/badges?userId={id}` - Get badges
- `GET /api/learning/gamification/streak?userId={id}` - Get streak
- `POST /api/learning/gamification/streak` - Update streak

---

## 🐛 Troubleshooting

### Common Issues

**1. "modulesData is not iterable"**
- **Fix:** Ensure API returns array, check error responses
- **Solution:** Added array checks in frontend code

**2. "Access denied. IP blocked"**
- **Fix:** Suspicious pattern detection too aggressive
- **Solution:** Only check pathname, not query parameters

**3. "Price column missing"**
- **Fix:** Run migration script 046
- **Solution:** Price now included in main schema

**4. "Lessons not unlocking"**
- **Fix:** Check previous lesson status
- **Solution:** Verify `user_lesson_progress.status = 'completed'`

**5. "XP not updating"**
- **Fix:** Check `user_xp_summary` exists
- **Solution:** Initialize on user registration

---

## ✅ Checklist

### Database Setup
- [ ] Run `045-gamified-learning-path-schema.sql`
- [ ] Verify all 15 tables created
- [ ] Verify 8 levels inserted
- [ ] Verify 7 badges inserted
- [ ] Verify price column exists

### API Setup
- [ ] All endpoints accessible
- [ ] Admin authentication working
- [ ] Student enrollment working
- [ ] Progress tracking working

### Frontend Setup
- [ ] Admin can create courses
- [ ] Admin can manage modules/lessons/quizzes/tasks
- [ ] Students can enroll
- [ ] Students can view dashboard
- [ ] Progress updates correctly

---

## 📚 Related Files

- **Schema:** `scripts/045-gamified-learning-path-schema.sql`
- **Price Migration:** `scripts/046-add-price-to-courses.sql`
- **Documentation:** 
  - `docs/GAMIFIED_LEARNING_PATH.md`
  - `docs/LEARNING_PATH_IMPLEMENTATION.md`
  - `docs/MARKAANO_GOLD_IMPLEMENTATION.md`

---

## 🎉 Summary

The learning system is **complete and production-ready** with:

✅ Full CRUD for courses, modules, lessons, quizzes, tasks
✅ Sequential unlocking logic
✅ Progress tracking (lesson → module → course)
✅ Gamification (XP, levels, badges, streaks)
✅ Admin management interface
✅ Student dashboard
✅ Price support for courses
✅ Security & authentication
✅ Error handling & validation

**Everything is documented and ready to use!** 🚀
