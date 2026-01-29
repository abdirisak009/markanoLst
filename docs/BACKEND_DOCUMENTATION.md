# 📚 Markano Backend - Complete API Documentation

## 🎯 Overview

This document provides comprehensive documentation for the Markano backend system, including all API endpoints, database schemas, authentication mechanisms, and system architecture.

**Last Updated:** January 2026

---

## 🏗️ Architecture

### Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Node.js
- **Database:** PostgreSQL (Neon Serverless)
- **ORM/Query:** Neon Serverless SQL (tagged template literals)
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Authentication:** Custom token-based system with cookies
- **Security:** Custom middleware with rate limiting, IP blocking, and input validation

### System Components

1. **API Routes** (`app/api/`) - Next.js API route handlers
2. **Database Layer** (`lib/db.ts`) - Database connection and helper functions
3. **Authentication** (`lib/auth.ts`) - Token generation and verification
4. **Security Middleware** (`proxy.ts`) - Request filtering, rate limiting, and authorization
5. **External Services:**
   - Cloudflare R2 for file storage (`lib/r2-client.ts`)
   - WhatsApp API for messaging (`lib/whatsapp.ts`)
   - Email service (placeholder, `lib/email.ts`)

---

## 🗄️ Database Schema

### Core Tables

#### Admin & Users
- `admin_users` - Admin user accounts
- `user_permissions` - Admin user permissions

#### Universities & Classes
- `universities` - University information
- `classes` - Class definitions (penn/university types)
- `penn_students` - Penn student registrations
- `university_students` - University student registrations

#### Courses & Learning
- `courses` - Legacy course catalog
- `modules` - Course modules
- `lessons` - Individual lessons
- `assignments` - Course assignments
- `student_marks` - Student assignment marks
- `student_progress` - Student lesson progress

#### Markano Gold System
- `gold_students` - Gold student accounts
- `gold_tracks` - Learning tracks/paths
- `gold_levels` - Levels within tracks
- `gold_lessons` - Lessons in gold system
- `gold_enrollments` - Student track enrollments
- `gold_level_requests` - Level advancement requests
- `gold_applications` - Track application requests

#### Gamified Learning System
- `learning_courses` - New learning course catalog
- `learning_modules` - Modules within courses
- `learning_lessons` - Individual lessons
- `lesson_quizzes` - Quiz questions per lesson
- `lesson_tasks` - Tasks/reflections per lesson
- `user_lesson_progress` - Individual lesson progress
- `user_course_progress` - Course-level progress
- `user_xp` - XP transaction log
- `user_xp_summary` - Aggregated XP for levels
- `learning_levels` - Level definitions (8 levels)
- `learning_badges` - Badge definitions
- `user_badges` - Earned badges
- `daily_streaks` - Daily activity tracking
- `quiz_submissions` - Quiz answers
- `task_submissions` - Task submissions
- `learning_payments` - Course payment records

#### Videos
- `videos` - Video catalog
- `video_categories` - Video categories
- `video_progress` - Student video watch progress
- `video_analytics` - Video analytics data

#### Groups & E-commerce
- `groups` - Student groups
- `group_members` - Group membership
- `group_payments` - Group payment records
- `group_expenses` - Group expense tracking
- `ecommerce_submissions` - E-commerce project submissions
- `ecommerce_wizard_data` - E-commerce wizard form data

#### Quizzes & Challenges
- `quizzes` - Quiz definitions
- `quiz_questions` - Quiz questions
- `quiz_submissions` - Quiz submissions
- `challenges` - Coding challenges
- `challenge_submissions` - Challenge submissions
- `live_coding_challenges` - Live coding challenges
- `live_coding_participants` - Live coding participants
- `live_coding_teams` - Live coding teams

#### Forum
- `forum_categories` - Forum categories
- `forum_topics` - Forum topics/posts
- `forum_replies` - Forum replies

#### Financial
- `payments` - Payment records
- `offline_payments` - Offline payment records
- `general_expenses` - General expense tracking

#### Temporary Activities
- `temporary_activities` - Temporary activity submissions

---

## 🔐 Authentication & Authorization

### Token System

The system uses custom JWT-like tokens stored in HTTP-only cookies:

- **Admin Tokens:** `admin_token` cookie
- **Gold Student Tokens:** `gold_student_token` cookie
- **Session Cookies:** `adminSession`, `goldStudentId` for legacy support

### Token Structure

```typescript
{
  id: number,
  username/email: string,
  role: string, // "admin" | "super_admin" | "gold_student"
  exp: number, // Expiry timestamp
  iat: number, // Issued at timestamp
  type: string // "admin" | "gold_student"
}
```

### Authentication Flow

1. User submits credentials to login endpoint
2. Server validates credentials against database
3. Server generates signed token
4. Token stored in HTTP-only cookie
5. Subsequent requests include cookie automatically
6. Middleware verifies token on protected routes

### Authorization Levels

1. **Public Routes** - No authentication required
2. **Admin Routes** - Requires `admin_token` or `adminSession` cookie
3. **Gold Student Routes** - Requires `gold_student_token` or `goldStudentId` cookie
4. **Protected API Routes** - Admin authentication for POST/PUT/DELETE operations

---

## 🛡️ Security Middleware

The `proxy.ts` middleware provides:

### Features

1. **IP Blocking** - Blocks suspicious IPs temporarily or permanently
2. **Rate Limiting:**
   - Auth endpoints: 5 requests per 15 minutes
   - Registration: 10 requests per 15 minutes
   - API endpoints: 100 requests per minute
   - Public endpoints: 200 requests per minute
3. **Input Validation** - Detects SQL injection, XSS, and other attacks
4. **Token Verification** - Validates authentication tokens
5. **Security Headers** - Adds security headers to all responses

### Protected Routes

**Admin Protected API Routes:**
- `/api/admin/*`
- `/api/classes`
- `/api/courses`
- `/api/modules`
- `/api/lessons`
- `/api/assignments`
- `/api/universities`
- `/api/university-students`
- `/api/penn-students`
- `/api/groups`
- `/api/enrollments`
- `/api/videos`
- `/api/challenges`
- `/api/financial-report`
- `/api/general-expenses`
- `/api/student-marks`
- `/api/upload`
- `/api/learning/courses` (POST/PUT/DELETE)
- `/api/learning/modules` (POST/PUT/DELETE)
- `/api/learning/lessons` (POST/PUT/DELETE)
- `/api/learning/quizzes` (POST/PUT/DELETE)
- `/api/learning/tasks` (POST/PUT/DELETE)

**Public Routes:**
- `/api/admin/login`
- `/api/admin/auth/login`
- `/api/gold/auth/login`
- `/api/gold/auth/register`
- `/api/gold/students` (POST for registration)
- `/api/gold/tracks`
- `/api/gold/levels`
- `/api/gold/lessons` (GET)
- `/api/quiz`
- `/api/forum`
- `/api/videos/public`
- `/api/videos/verify-student`
- `/api/videos/categories`
- `/api/dashboard/stats`
- `/api/live-coding`

---

## 📡 API Endpoints

### Admin Authentication

#### `POST /api/admin/login`
Admin login endpoint.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@markano.com",
    "full_name": "Admin User",
    "role": "admin",
    "permissions": ["permission1", "permission2"]
  }
}
```

**Cookies Set:**
- `admin_token` - Authentication token
- `adminSession` - Session flag
- `sessionExpiry` - Session expiry timestamp
- `adminUser` - User data

---

#### `POST /api/admin/auth/login`
Alternative admin login endpoint (same functionality as above).

---

### Admin Users Management

#### `GET /api/admin/users`
Get all admin users with permissions.

**Auth:** Admin required

**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@markano.com",
    "full_name": "Admin User",
    "role": "admin",
    "status": "active",
    "permissions": ["permission1", "permission2"],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/admin/users`
Create new admin user.

**Auth:** Admin required

**Request Body:**
```json
{
  "username": "newadmin",
  "email": "newadmin@markano.com",
  "full_name": "New Admin",
  "password": "securepassword",
  "role": "admin",
  "permissions": ["permission1", "permission2"],
  "profile_image": "https://..."
}
```

**Response:**
```json
{
  "id": 2,
  "username": "newadmin",
  "email": "newadmin@markano.com",
  "full_name": "New Admin",
  "role": "admin",
  "status": "active",
  "permissions": ["permission1", "permission2"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `GET /api/admin/users/[id]`
Get specific admin user.

**Auth:** Admin required

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@markano.com",
  "full_name": "Admin User",
  "role": "admin",
  "status": "active",
  "permissions": ["permission1"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `PUT /api/admin/users/[id]`
Update admin user.

**Auth:** Admin required

**Request Body:**
```json
{
  "username": "updatedadmin",
  "email": "updated@markano.com",
  "full_name": "Updated Admin",
  "role": "admin",
  "status": "active",
  "permissions": ["permission1", "permission2"]
}
```

---

#### `DELETE /api/admin/users/[id]`
Delete admin user.

**Auth:** Admin required

---

### Universities & Classes

#### `GET /api/universities`
Get all universities.

**Response:**
```json
[
  {
    "id": 1,
    "name": "University Name",
    "abbreviation": "UN",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/universities`
Create university.

**Auth:** Admin required

**Request Body:**
```json
{
  "name": "University Name",
  "abbreviation": "UN"
}
```

---

#### `PUT /api/universities`
Update university.

**Auth:** Admin required

**Request Body:**
```json
{
  "id": 1,
  "name": "Updated Name",
  "abbreviation": "UN2"
}
```

---

#### `DELETE /api/universities`
Delete university.

**Auth:** Admin required

**Query Params:** `id` - University ID

---

#### `GET /api/classes`
Get all classes.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Class Name",
    "type": "penn",
    "university_id": 1,
    "university_name": "University Name",
    "description": "Class description",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/classes`
Create class.

**Auth:** Admin required

**Request Body:**
```json
{
  "name": "Class Name",
  "type": "penn",
  "university_id": 1,
  "description": "Class description"
}
```

---

#### `DELETE /api/classes`
Delete class.

**Auth:** Admin required

**Query Params:** `id` - Class ID

---

### Students

#### `GET /api/penn-students`
Get all Penn students.

**Auth:** Admin required (for modifying operations)

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "PENN001",
    "full_name": "Student Name",
    "email": "student@example.com",
    "username": "username",
    "phone": "+252611234567",
    "selected_course": "Web Development",
    "status": "pending",
    "registered_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/penn-students`
Create Penn student.

**Auth:** Admin required

**Request Body:**
```json
{
  "studentId": "PENN001",
  "fullName": "Student Name",
  "email": "student@example.com",
  "username": "username",
  "phone": "+252611234567",
  "selectedCourse": "Web Development",
  "status": "pending"
}
```

---

#### `PUT /api/penn-students`
Update Penn student.

**Auth:** Admin required

---

#### `DELETE /api/penn-students`
Delete Penn student.

**Auth:** Admin required

**Query Params:** `id` - Student ID

---

#### `POST /api/penn-students/bulk-upload`
Bulk upload Penn students from Excel file.

**Auth:** Admin required

**Request:** Multipart form data with Excel file

---

#### `GET /api/university-students`
Get all university students.

**Auth:** Admin required (for modifying operations)

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "UNIV001",
    "full_name": "Student Name",
    "phone": "+252611234567",
    "address": "Address",
    "university_id": 1,
    "university_name": "University Name",
    "class_id": 1,
    "class_name": "Class Name",
    "status": "active",
    "registered_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/university-students`
Create university student.

**Auth:** Admin required

**Request Body:**
```json
{
  "studentId": "UNIV001",
  "fullName": "Student Name",
  "phone": "+252611234567",
  "address": "Address",
  "universityId": 1,
  "classId": 1,
  "status": "active"
}
```

---

#### `PUT /api/university-students`
Update university student.

**Auth:** Admin required

---

#### `DELETE /api/university-students`
Delete university student.

**Auth:** Admin required

**Query Params:** `id` - Student ID

---

#### `POST /api/university-students/bulk-upload`
Bulk upload university students from Excel file.

**Auth:** Admin required

---

#### `GET /api/students/all`
Get all students (combined).

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "full_name": "Student Name",
    "type": "penn",
    "status": "active"
  }
]
```

---

#### `GET /api/students/[studentId]`
Get specific student.

**Response:**
```json
{
  "id": 1,
  "student_id": "STU001",
  "full_name": "Student Name",
  "type": "penn",
  "status": "active"
}
```

---

#### `GET /api/students/performance`
Get student performance data.

**Query Params:** `studentId` - Student ID

---

#### `GET /api/students/group-info`
Get student's group information.

**Query Params:** `studentId` - Student ID

---

#### `GET /api/students/available-for-group`
Get students available for group assignment.

---

### Courses & Learning (Legacy)

#### `GET /api/courses`
Get all courses.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Course Title",
    "description": "Course description",
    "instructor": "Instructor Name",
    "duration": "10 hours",
    "thumbnail": "https://...",
    "rating": 4.5,
    "students_count": 100,
    "type": "penn",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/courses`
Create course.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "instructor": "Instructor Name",
  "duration": "10 hours",
  "thumbnail": "https://...",
  "rating": 4.5,
  "studentsCount": 0,
  "type": "penn"
}
```

---

#### `GET /api/modules`
Get modules.

**Query Params:** `courseId` - Course ID

**Response:**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "title": "Module Title",
    "order_index": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/modules`
Create module.

**Auth:** Admin required

**Request Body:**
```json
{
  "course_id": 1,
  "title": "Module Title",
  "order_index": 1
}
```

---

#### `PUT /api/modules`
Update module.

**Auth:** Admin required

---

#### `DELETE /api/modules`
Delete module.

**Auth:** Admin required

**Query Params:** `id` - Module ID

---

#### `GET /api/lessons`
Get lessons.

**Query Params:** `moduleId` - Module ID

**Response:**
```json
[
  {
    "id": 1,
    "module_id": 1,
    "title": "Lesson Title",
    "duration": "30 min",
    "video_url": "https://...",
    "content": "Lesson content",
    "order_index": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/lessons`
Create lesson.

**Auth:** Admin required

**Request Body:**
```json
{
  "module_id": 1,
  "title": "Lesson Title",
  "duration": "30 min",
  "video_url": "https://...",
  "content": "Lesson content",
  "order_index": 1
}
```

---

#### `PUT /api/lessons`
Update lesson.

**Auth:** Admin required

---

#### `DELETE /api/lessons`
Delete lesson.

**Auth:** Admin required

**Query Params:** `id` - Lesson ID

---

### Gamified Learning System

#### `GET /api/learning/courses`
Get all active learning courses.

**Query Params:**
- `userId` (optional) - Filter courses with user progress

**Response:**
```json
[
  {
    "id": 1,
    "title": "Course Title",
    "slug": "course-slug",
    "description": "Course description",
    "thumbnail_url": "https://...",
    "instructor_name": "Instructor",
    "estimated_duration_minutes": 600,
    "difficulty_level": "beginner",
    "price": 0,
    "is_featured": true,
    "modules_count": 5,
    "lessons_count": 20,
    "progress": {
      "progress_percentage": 50,
      "lessons_completed": 10,
      "total_lessons": 20,
      "current_lesson_id": 11,
      "last_accessed_at": "2024-01-01T00:00:00Z"
    }
  }
]
```

---

#### `POST /api/learning/courses`
Create learning course.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Course Title",
  "slug": "course-slug",
  "description": "Course description",
  "thumbnail_url": "https://...",
  "instructor_name": "Instructor",
  "estimated_duration_minutes": 600,
  "difficulty_level": "beginner",
  "price": 0,
  "is_featured": false,
  "order_index": 0
}
```

---

#### `GET /api/learning/courses/[courseId]`
Get course details with modules and lessons.

**Query Params:**
- `userId` (optional) - Include user progress

**Response:**
```json
{
  "course": {
    "id": 1,
    "title": "Course Title",
    "slug": "course-slug",
    "description": "Course description",
    "thumbnail_url": "https://...",
    "instructor_name": "Instructor",
    "estimated_duration_minutes": 600,
    "difficulty_level": "beginner",
    "price": 0
  },
  "modules": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Module Title",
      "description": "Module description",
      "order_index": 1,
      "lessons": [
        {
          "id": 1,
          "module_id": 1,
          "title": "Lesson Title",
          "video_url": "https://...",
          "xp_reward": 10,
          "order_index": 1,
          "is_unlocked": true
        }
      ]
    }
  ],
  "progress": {
    "progress_percentage": 50,
    "lessons_completed": 10,
    "total_lessons": 20
  }
}
```

---

#### `PUT /api/learning/courses/[courseId]`
Update learning course.

**Auth:** Admin required

---

#### `DELETE /api/learning/courses/[courseId]`
Delete learning course.

**Auth:** Admin required

---

#### `GET /api/learning/modules`
Get modules for a course.

**Query Params:** `courseId` - Course ID

**Response:**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "title": "Module Title",
    "description": "Module description",
    "order_index": 1,
    "is_active": true
  }
]
```

---

#### `POST /api/learning/modules`
Create module.

**Auth:** Admin required

**Request Body:**
```json
{
  "course_id": 1,
  "title": "Module Title",
  "description": "Module description",
  "order_index": 1
}
```

---

#### `PUT /api/learning/modules`
Update module.

**Auth:** Admin required

**Request Body:**
```json
{
  "id": 1,
  "course_id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "order_index": 1,
  "is_active": true
}
```

---

#### `DELETE /api/learning/modules`
Delete module.

**Auth:** Admin required

**Query Params:** `id` - Module ID

---

#### `GET /api/learning/lessons`
Get lessons for a module.

**Query Params:** `moduleId` - Module ID

**Response:**
```json
[
  {
    "id": 1,
    "module_id": 1,
    "title": "Lesson Title",
    "video_url": "https://...",
    "content": "Lesson content",
    "xp_reward": 10,
    "order_index": 1,
    "is_active": true
  }
]
```

---

#### `GET /api/learning/lessons/[lessonId]`
Get lesson details with quizzes and tasks.

**Query Params:** `userId` (optional) - Include user progress

**Response:**
```json
{
  "lesson": {
    "id": 1,
    "module_id": 1,
    "title": "Lesson Title",
    "video_url": "https://...",
    "content": "Lesson content",
    "xp_reward": 10,
    "order_index": 1
  },
  "quizzes": [
    {
      "id": 1,
      "lesson_id": 1,
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correct_answer": "Option 1",
      "explanation": "Explanation text",
      "question_type": "multiple_choice"
    }
  ],
  "tasks": [
    {
      "id": 1,
      "lesson_id": 1,
      "task_type": "reflection",
      "title": "Task Title",
      "instructions": "Task instructions"
    }
  ],
  "progress": {
    "status": "in_progress",
    "video_watched": true,
    "quiz_completed": false,
    "task_completed": false
  },
  "is_unlocked": true
}
```

---

#### `POST /api/learning/lessons`
Create lesson.

**Auth:** Admin required

**Request Body:**
```json
{
  "module_id": 1,
  "title": "Lesson Title",
  "video_url": "https://...",
  "content": "Lesson content",
  "xp_reward": 10,
  "order_index": 1
}
```

---

#### `PUT /api/learning/lessons`
Update lesson.

**Auth:** Admin required

---

#### `DELETE /api/learning/lessons`
Delete lesson.

**Auth:** Admin required

**Query Params:** `id` - Lesson ID

---

#### `GET /api/learning/quizzes`
Get quizzes for a lesson.

**Query Params:** `lessonId` - Lesson ID

**Response:**
```json
[
  {
    "id": 1,
    "lesson_id": 1,
    "question": "Question text?",
    "options": ["Option 1", "Option 2", "Option 3"],
    "correct_answer": "Option 1",
    "explanation": "Explanation text",
    "question_type": "multiple_choice",
    "order_index": 1
  }
]
```

---

#### `POST /api/learning/quizzes`
Create quiz.

**Auth:** Admin required

**Request Body:**
```json
{
  "lesson_id": 1,
  "question": "Question text?",
  "options": ["Option 1", "Option 2", "Option 3"],
  "correct_answer": "Option 1",
  "explanation": "Explanation text",
  "question_type": "multiple_choice",
  "order_index": 1
}
```

---

#### `PUT /api/learning/quizzes`
Update quiz.

**Auth:** Admin required

---

#### `DELETE /api/learning/quizzes`
Delete quiz.

**Auth:** Admin required

**Query Params:** `id` - Quiz ID

---

#### `POST /api/learning/quiz/submit`
Submit quiz answer.

**Request Body:**
```json
{
  "user_id": 1,
  "quiz_id": 1,
  "answer": "Option 1"
}
```

**Response:**
```json
{
  "correct": true,
  "xp_earned": 5,
  "message": "Correct answer!"
}
```

---

#### `GET /api/learning/tasks`
Get tasks for a lesson.

**Query Params:** `lessonId` - Lesson ID

**Response:**
```json
[
  {
    "id": 1,
    "lesson_id": 1,
    "task_type": "reflection",
    "title": "Task Title",
    "instructions": "Task instructions",
    "coding_practice": false
  }
]
```

---

#### `POST /api/learning/tasks`
Create task.

**Auth:** Admin required

**Request Body:**
```json
{
  "lesson_id": 1,
  "task_type": "reflection",
  "title": "Task Title",
  "instructions": "Task instructions",
  "coding_practice": false
}
```

---

#### `PUT /api/learning/tasks`
Update task.

**Auth:** Admin required

---

#### `DELETE /api/learning/tasks`
Delete task.

**Auth:** Admin required

**Query Params:** `id` - Task ID

---

#### `POST /api/learning/task/submit`
Submit task.

**Request Body:**
```json
{
  "user_id": 1,
  "task_id": 1,
  "submission": "Task submission text",
  "code": "// Code if coding practice"
}
```

---

#### `POST /api/learning/enroll`
Enroll in course.

**Request Body:**
```json
{
  "user_id": 1,
  "course_id": 1
}
```

---

#### `POST /api/learning/progress`
Update lesson progress.

**Request Body:**
```json
{
  "user_id": 1,
  "lesson_id": 1,
  "video_watched": true,
  "quiz_completed": true,
  "task_completed": true
}
```

---

#### `GET /api/learning/gamification/xp`
Get user XP and level.

**Query Params:** `userId` - User ID

**Response:**
```json
{
  "total_xp": 500,
  "current_level": {
    "level_number": 4,
    "level_name": "Student",
    "xp_required": 500,
    "badge_icon": "🎓"
  },
  "xp_to_next_level": 0,
  "next_level": {
    "level_number": 5,
    "level_name": "Scholar",
    "xp_required": 1000
  }
}
```

---

#### `GET /api/learning/gamification/badges`
Get user badges.

**Query Params:** `userId` - User ID

**Response:**
```json
[
  {
    "badge_id": 1,
    "badge_key": "first_lesson",
    "badge_name": "First Lesson",
    "badge_icon": "🌟",
    "earned_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `GET /api/learning/gamification/streak`
Get user daily streak.

**Query Params:** `userId` - User ID

**Response:**
```json
{
  "current_streak": 5,
  "longest_streak": 10,
  "last_activity_date": "2024-01-05"
}
```

---

#### `POST /api/learning/gamification/streak`
Update daily streak.

**Request Body:**
```json
{
  "user_id": 1
}
```

---

#### `POST /api/learning/payment`
Process course payment.

**Request Body:**
```json
{
  "user_id": 1,
  "course_id": 1,
  "amount": 50,
  "payment_method": "online",
  "payment_reference": "REF123"
}
```

---

#### `POST /api/learning/code/execute`
Execute code in sandbox.

**Request Body:**
```json
{
  "code": "console.log('Hello World');",
  "language": "javascript"
}
```

**Response:**
```json
{
  "output": "Hello World",
  "error": null,
  "execution_time": 10
}
```

---

### Markano Gold System

#### `POST /api/gold/auth/register`
Register new Gold student.

**Request Body:**
```json
{
  "full_name": "Student Name",
  "email": "student@example.com",
  "password": "securepassword",
  "university": "University Name",
  "field_of_study": "Computer Science",
  "whatsapp_number": "+252611234567"
}
```

**Response:**
```json
{
  "success": true,
  "student": {
    "id": 1,
    "full_name": "Student Name",
    "email": "student@example.com",
    "account_status": "pending"
  }
}
```

---

#### `POST /api/gold/auth/login`
Login Gold student.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "student": {
    "id": 1,
    "full_name": "Student Name",
    "email": "student@example.com",
    "account_status": "active"
  },
  "enrollments": [
    {
      "id": 1,
      "track_id": 1,
      "track_title": "Web Development",
      "status": "active"
    }
  ]
}
```

**Cookies Set:**
- `gold_student_token` - Authentication token
- `goldStudentId` - Student ID

---

#### `GET /api/gold/students`
Get Gold students (admin) or own profile (student).

**Auth:** Admin for all students, Student for own profile

**Query Params:**
- `id` (optional) - Specific student ID

---

#### `POST /api/gold/students`
Create Gold student (registration).

**Request Body:**
```json
{
  "full_name": "Student Name",
  "email": "student@example.com",
  "password": "securepassword",
  "university": "University Name",
  "field_of_study": "Computer Science",
  "whatsapp_number": "+252611234567"
}
```

---

#### `GET /api/gold/students/profile`
Get student profile.

**Auth:** Gold student required

**Response:**
```json
{
  "id": 1,
  "full_name": "Student Name",
  "email": "student@example.com",
  "university": "University Name",
  "field_of_study": "Computer Science",
  "profile_image": "https://...",
  "account_status": "active"
}
```

---

#### `POST /api/admin/gold/students/change-password`
Change student password (admin).

**Auth:** Admin required

**Request Body:**
```json
{
  "student_id": 1,
  "new_password": "newsecurepassword"
}
```

---

#### `GET /api/gold/progress`
Get student progress.

**Query Params:** `studentId` - Student ID

**Response:**
```json
{
  "enrollments": [
    {
      "track_id": 1,
      "track_name": "Web Development",
      "level_id": 2,
      "level_name": "Level 2",
      "lessons_completed": 10,
      "total_lessons": 20
    }
  ]
}
```

---

### Videos

#### `GET /api/videos`
Get all videos.

**Auth:** Admin required (for modifying operations)

**Query Params:**
- `category` (optional) - Filter by category
- `search` (optional) - Search term

**Response:**
```json
[
  {
    "id": 1,
    "title": "Video Title",
    "description": "Video description",
    "url": "https://...",
    "duration": "10:30",
    "category": "web-development",
    "views": 1000,
    "uploaded_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/videos`
Create video.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Video Title",
  "description": "Video description",
  "url": "https://...",
  "duration": "10:30",
  "category": "web-development"
}
```

---

#### `GET /api/videos/[id]`
Get specific video.

**Response:**
```json
{
  "id": 1,
  "title": "Video Title",
  "description": "Video description",
  "url": "https://...",
  "duration": "10:30",
  "category": "web-development",
  "views": 1000
}
```

---

#### `PUT /api/videos/[id]`
Update video.

**Auth:** Admin required

---

#### `DELETE /api/videos/[id]`
Delete video.

**Auth:** Admin required

---

#### `GET /api/videos/public`
Get public videos.

**Response:** Same as GET /api/videos

---

#### `GET /api/videos/categories`
Get video categories.

**Response:**
```json
[
  {
    "category": "web-development",
    "count": 50
  }
]
```

---

#### `POST /api/videos/verify-student`
Verify student access to video.

**Request Body:**
```json
{
  "student_id": "STU001",
  "video_id": 1
}
```

**Response:**
```json
{
  "allowed": true,
  "message": "Access granted"
}
```

---

#### `POST /api/videos/track`
Track video watch progress.

**Request Body:**
```json
{
  "student_id": "STU001",
  "video_id": 1,
  "current_time": 300,
  "duration": 600,
  "completed": false
}
```

---

#### `GET /api/videos/progress/[id]`
Get video progress for student.

**Query Params:** `studentId` - Student ID

---

#### `GET /api/videos/student-progress`
Get all video progress for student.

**Query Params:** `studentId` - Student ID

---

#### `POST /api/videos/skip-event`
Record video skip event.

**Request Body:**
```json
{
  "student_id": "STU001",
  "video_id": 1,
  "skip_time": 30,
  "skip_to": 60
}
```

---

#### `GET /api/videos/analytics`
Get video analytics.

**Auth:** Admin required

**Query Params:**
- `videoId` (optional) - Specific video ID
- `startDate` (optional) - Start date
- `endDate` (optional) - End date

---

### Groups

#### `GET /api/groups`
Get all groups.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Group Name",
    "leader_id": "STU001",
    "leader_name": "Leader Name",
    "member_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/groups`
Create group.

**Auth:** Admin required

**Request Body:**
```json
{
  "name": "Group Name",
  "leader_id": "STU001"
}
```

---

#### `GET /api/groups/[id]`
Get group details.

**Response:**
```json
{
  "id": 1,
  "name": "Group Name",
  "leader_id": "STU001",
  "leader_name": "Leader Name",
  "members": [
    {
      "student_id": "STU001",
      "full_name": "Student Name",
      "role": "leader"
    }
  ],
  "payments": [],
  "expenses": []
}
```

---

#### `PUT /api/groups/[id]`
Update group.

**Auth:** Admin required

---

#### `DELETE /api/groups/[id]`
Delete group.

**Auth:** Admin required

---

#### `GET /api/groups/[id]/members`
Get group members.

**Response:**
```json
[
  {
    "student_id": "STU001",
    "full_name": "Student Name",
    "role": "leader",
    "joined_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/groups/[id]/members`
Add member to group.

**Auth:** Admin required

**Request Body:**
```json
{
  "student_id": "STU002"
}
```

---

#### `DELETE /api/groups/[id]/members/[studentId]`
Remove member from group.

**Auth:** Admin required

---

#### `GET /api/groups/[id]/payments`
Get group payments.

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "amount": 100,
    "payment_method": "cash",
    "payment_date": "2024-01-01",
    "status": "confirmed"
  }
]
```

---

#### `POST /api/groups/[id]/payments`
Add group payment.

**Auth:** Admin required

**Request Body:**
```json
{
  "student_id": "STU001",
  "amount": 100,
  "payment_method": "cash",
  "payment_date": "2024-01-01"
}
```

---

#### `GET /api/groups/[id]/payments/[studentId]`
Get payments for specific student in group.

---

#### `GET /api/groups/[id]/expenses`
Get group expenses.

**Response:**
```json
[
  {
    "id": 1,
    "description": "Expense description",
    "amount": 50,
    "expense_date": "2024-01-01",
    "created_by": "Admin"
  }
]
```

---

#### `POST /api/groups/[id]/expenses`
Add group expense.

**Auth:** Admin required

**Request Body:**
```json
{
  "description": "Expense description",
  "amount": 50,
  "expense_date": "2024-01-01"
}
```

---

#### `POST /api/groups/leader-verify`
Verify group leader.

**Request Body:**
```json
{
  "group_id": 1,
  "student_id": "STU001"
}
```

---

#### `GET /api/groups/students-available`
Get students available for group assignment.

---

#### `GET /api/groups/ungrouped-students`
Get students not in any group.

---

#### `POST /api/groups/transfer`
Transfer group leadership.

**Auth:** Admin required

**Request Body:**
```json
{
  "group_id": 1,
  "new_leader_id": "STU002"
}
```

---

### E-commerce Wizard

#### `GET /api/ecommerce-wizard/groups`
Get groups for e-commerce wizard.

---

#### `GET /api/ecommerce-wizard/[groupId]`
Get wizard data for group.

**Response:**
```json
{
  "group_id": 1,
  "step": 3,
  "data": {
    "business_name": "Business Name",
    "products": []
  }
}
```

---

#### `POST /api/ecommerce-wizard/[groupId]`
Update wizard data.

**Request Body:**
```json
{
  "step": 3,
  "data": {
    "business_name": "Business Name"
  }
}
```

---

#### `POST /api/ecommerce-wizard/save`
Save wizard progress.

**Request Body:**
```json
{
  "group_id": 1,
  "step": 3,
  "data": {}
}
```

---

#### `POST /api/ecommerce-wizard/submit`
Submit completed wizard.

**Request Body:**
```json
{
  "group_id": 1,
  "data": {}
}
```

---

#### `POST /api/ecommerce-wizard/[groupId]/submit`
Submit wizard for specific group.

---

#### `GET /api/ecommerce-wizard/submissions`
Get wizard submissions.

**Auth:** Admin required

---

#### `GET /api/ecommerce-wizard/submission`
Get specific submission.

**Query Params:** `groupId` - Group ID

---

#### `GET /api/ecommerce-wizard/admin/submissions`
Get all submissions (admin).

**Auth:** Admin required

---

#### `POST /api/ecommerce-wizard/validate-group`
Validate group for wizard.

**Request Body:**
```json
{
  "group_id": 1
}
```

---

#### `POST /api/ecommerce-wizard/verify-leader`
Verify group leader for wizard.

**Request Body:**
```json
{
  "group_id": 1,
  "student_id": "STU001"
}
```

---

#### `GET /api/admin/ecommerce-submissions`
Get e-commerce submissions (admin).

**Auth:** Admin required

---

#### `GET /api/admin/ecommerce-submissions/[groupId]`
Get submission for specific group.

**Auth:** Admin required

---

### Quizzes

#### `GET /api/quiz/[code]`
Get quiz by access code.

**Query Params:** `code` - Quiz access code

**Response:**
```json
{
  "id": 1,
  "title": "Quiz Title",
  "description": "Quiz description",
  "access_code": "ABC123",
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["Option 1", "Option 2"],
      "question_type": "multiple_choice"
    }
  ]
}
```

---

#### `POST /api/quiz/[code]/verify`
Verify quiz access code.

**Request Body:**
```json
{
  "code": "ABC123"
}
```

---

#### `POST /api/quiz/[code]/submit`
Submit quiz answers.

**Request Body:**
```json
{
  "student_id": "STU001",
  "answers": [
    {
      "question_id": 1,
      "answer": "Option 1"
    }
  ]
}
```

---

#### `GET /api/admin/quizzes`
Get all quizzes (admin).

**Auth:** Admin required

---

#### `POST /api/admin/quizzes`
Create quiz (admin).

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz description",
  "access_code": "ABC123",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2"],
      "correct_answer": "Option 1",
      "question_type": "multiple_choice"
    }
  ]
}
```

---

#### `GET /api/admin/quizzes/[id]`
Get quiz details (admin).

**Auth:** Admin required

---

#### `PUT /api/admin/quizzes/[id]`
Update quiz (admin).

**Auth:** Admin required

---

#### `DELETE /api/admin/quizzes/[id]`
Delete quiz (admin).

**Auth:** Admin required

---

#### `GET /api/admin/quizzes/[id]/questions`
Get quiz questions (admin).

**Auth:** Admin required

---

#### `POST /api/admin/quizzes/[id]/questions`
Add question to quiz (admin).

**Auth:** Admin required

---

#### `GET /api/admin/quizzes/questions/[questionId]`
Get specific question (admin).

**Auth:** Admin required

---

#### `PUT /api/admin/quizzes/questions/[questionId]`
Update question (admin).

**Auth:** Admin required

---

#### `DELETE /api/admin/quizzes/questions/[questionId]`
Delete question (admin).

**Auth:** Admin required

---

#### `GET /api/admin/quizzes/[id]/results`
Get quiz results (admin).

**Auth:** Admin required

---

### Challenges

#### `GET /api/challenges`
Get all challenges.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Challenge Title",
    "description": "Challenge description",
    "difficulty": "medium",
    "points": 100,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
]
```

---

#### `POST /api/challenges`
Create challenge.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Challenge Title",
  "description": "Challenge description",
  "difficulty": "medium",
  "points": 100,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

---

#### `GET /api/challenges/[id]`
Get challenge details.

**Response:**
```json
{
  "id": 1,
  "title": "Challenge Title",
  "description": "Challenge description",
  "difficulty": "medium",
  "points": 100,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "submissions": []
}
```
---

#### `PUT /api/challenges/[id]`
Update challenge.

**Auth:** Admin required

---

#### `DELETE /api/challenges/[id]`
Delete challenge.

**Auth:** Admin required

---

#### `GET /api/challenges/[id]/submissions`
Get challenge submissions.

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "student_name": "Student Name",
    "submission": "Code submission",
    "score": 85,
    "submitted_at": "2024-01-15T00:00:00Z"
  }
]
```

---

#### `POST /api/challenges/[id]/submissions`
Submit challenge solution.

**Request Body:**
```json
{
  "student_id": "STU001",
  "submission": "Code solution"
}
```

---

#### `GET /api/challenges/[id]/leaderboard`
Get challenge leaderboard.

**Response:**
```json
[
  {
    "rank": 1,
    "student_id": "STU001",
    "student_name": "Student Name",
    "score": 100,
    "submitted_at": "2024-01-15T00:00:00Z"
  }
]
```

---

### Live Coding Challenges

#### `GET /api/live-coding/challenges`
Get all live coding challenges.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Live Challenge Title",
    "description": "Challenge description",
    "access_code": "LIVE123",
    "start_time": "2024-01-01T10:00:00Z",
    "end_time": "2024-01-01T12:00:00Z",
    "is_active": true
  }
]
```

---

#### `POST /api/live-coding/challenges`
Create live coding challenge.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Live Challenge Title",
  "description": "Challenge description",
  "access_code": "LIVE123",
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T12:00:00Z"
}
```

---

#### `GET /api/live-coding/challenges/[id]`
Get live challenge details.

---

#### `PUT /api/live-coding/challenges/[id]`
Update live challenge.

**Auth:** Admin required

---

#### `DELETE /api/live-coding/challenges/[id]`
Delete live challenge.

**Auth:** Admin required

---

#### `POST /api/live-coding/join/[accessCode]`
Join live coding challenge.

**Request Body:**
```json
{
  "student_id": "STU001",
  "student_name": "Student Name"
}
```

---

#### `GET /api/live-coding/challenges/[id]/participants`
Get challenge participants.

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "student_name": "Student Name",
    "joined_at": "2024-01-01T10:00:00Z",
    "status": "active"
  }
]
```

---

#### `POST /api/live-coding/challenges/[id]/participants`
Add participant to challenge.

**Auth:** Admin required

---

#### `GET /api/live-coding/challenges/[id]/participants/[participantId]`
Get specific participant.

---

#### `PUT /api/live-coding/challenges/[id]/participants/[participantId]`
Update participant status.

**Auth:** Admin required

---

#### `POST /api/live-coding/participants/[participantId]/unlock`
Unlock participant.

**Auth:** Admin required

---

#### `GET /api/live-coding/challenges/[id]/teams`
Get challenge teams.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Team Name",
    "members": ["STU001", "STU002"],
    "is_locked": false
  }
]
```

---

#### `POST /api/live-coding/challenges/[id]/teams`
Create team.

**Auth:** Admin required

---

#### `POST /api/live-coding/challenges/[id]/shuffle`
Shuffle participants into teams.

**Auth:** Admin required

---

#### `POST /api/live-coding/challenges/[id]/control`
Control challenge (start/stop/pause).

**Auth:** Admin required

**Request Body:**
```json
{
  "action": "start" // "start" | "stop" | "pause" | "resume"
}
```

---

#### `GET /api/live-coding/challenges/[id]/results`
Get challenge results.

**Response:**
```json
{
  "challenge_id": 1,
  "teams": [
    {
      "team_id": 1,
      "team_name": "Team Name",
      "score": 100,
      "rank": 1
    }
  ],
  "individual_scores": []
}
```

---

#### `POST /api/live-coding/submit`
Submit live coding solution.

**Request Body:**
```json
{
  "challenge_id": 1,
  "participant_id": 1,
  "code": "Solution code",
  "language": "javascript"
}
```

---

#### `POST /api/live-coding/activity`
Record activity during live coding.

**Request Body:**
```json
{
  "challenge_id": 1,
  "participant_id": 1,
  "activity_type": "code_submission",
  "data": {}
}
```

---

### Assignments & Marks

#### `GET /api/assignments`
Get all assignments.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Assignment Title",
    "description": "Assignment description",
    "class_id": 1,
    "class_name": "Class Name",
    "period": "regular",
    "max_marks": 100,
    "due_date": "2024-01-31",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/assignments`
Create assignment.

**Auth:** Admin required

**Request Body:**
```json
{
  "title": "Assignment Title",
  "description": "Assignment description",
  "class_id": 1,
  "period": "regular",
  "max_marks": 100,
  "due_date": "2024-01-31"
}
```

---

#### `DELETE /api/assignments`
Delete assignment.

**Auth:** Admin required

**Query Params:** `id` - Assignment ID

---

#### `GET /api/student-marks`
Get all student marks.

**Auth:** Admin required

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "assignment_id": 1,
    "assignment_title": "Assignment Title",
    "marks_obtained": 85,
    "percentage": 85,
    "grade": "A",
    "submitted_at": "2024-01-15T00:00:00Z"
  }
]
```

---

#### `POST /api/student-marks`
Save student marks.

**Auth:** Admin required

**Request Body:**
```json
{
  "student_id": "STU001",
  "assignment_id": 1,
  "marks_obtained": 85,
  "percentage": 85,
  "grade": "A"
}
```

---

### Enrollments

#### `GET /api/enrollments`
Get all enrollments.

**Auth:** Admin required

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "course_id": 1,
    "status": "pending",
    "enrolled_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/enrollments`
Create enrollment.

**Auth:** Admin required

**Request Body:**
```json
{
  "student_id": "STU001",
  "course_id": 1,
  "status": "pending"
}
```

---

#### `POST /api/admin/enrollments/[id]/approve`
Approve enrollment.

**Auth:** Admin required

---

#### `POST /api/admin/enrollments/[id]/reject`
Reject enrollment.

**Auth:** Admin required

---

### Payments

#### `GET /api/admin/offline-payments`
Get offline payments.

**Auth:** Admin required

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "amount": 100,
    "payment_method": "cash",
    "payment_date": "2024-01-01",
    "status": "pending",
    "submitted_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/admin/offline-payments`
Create offline payment record.

**Auth:** Admin required

---

#### `POST /api/admin/offline-payments/[id]/approve`
Approve offline payment.

**Auth:** Admin required

---

#### `POST /api/admin/offline-payments/[id]/reject`
Reject offline payment.

**Auth:** Admin required

---

### Forum

#### `GET /api/forum/categories`
Get forum categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Category Name",
    "description": "Category description",
    "topic_count": 10
  }
]
```

---

#### `GET /api/forum/topics`
Get forum topics.

**Query Params:**
- `categoryId` (optional) - Filter by category

**Response:**
```json
[
  {
    "id": 1,
    "category_id": 1,
    "title": "Topic Title",
    "content": "Topic content",
    "author_id": "STU001",
    "author_name": "Author Name",
    "reply_count": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Financial Reports

#### `GET /api/financial-report`
Get financial report.

**Auth:** Admin required

**Query Params:**
- `startDate` (optional) - Start date
- `endDate` (optional) - End date

**Response:**
```json
{
  "total_revenue": 10000,
  "total_expenses": 5000,
  "net_profit": 5000,
  "payments": [],
  "expenses": []
}
```

---

#### `GET /api/general-expenses`
Get general expenses.

**Auth:** Admin required

**Response:**
```json
[
  {
    "id": 1,
    "description": "Expense description",
    "amount": 100,
    "expense_date": "2024-01-01",
    "category": "office",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/general-expenses`
Create general expense.

**Auth:** Admin required

**Request Body:**
```json
{
  "description": "Expense description",
  "amount": 100,
  "expense_date": "2024-01-01",
  "category": "office"
}
```

---

### Temporary Activities

#### `GET /api/admin/temporary-activities`
Get temporary activities.

**Auth:** Admin required

**Query Params:**
- `search` (optional) - Search term
- `status` (optional) - Filter by status

**Response:**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "student_name": "Student Name",
    "activity_type": "project",
    "submission": "Submission text",
    "rating": 4,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### `POST /api/admin/temporary-activities`
Create temporary activity.

**Auth:** Admin required

---

#### `POST /api/admin/temporary-activities/upload`
Upload temporary activity file.

**Auth:** Admin required

**Request:** Multipart form data

---

#### `POST /api/admin/temporary-activities/rate`
Rate temporary activity.

**Auth:** Admin required

**Request Body:**
```json
{
  "activity_id": 1,
  "rating": 4
}
```

---

#### `GET /api/admin/temporary-activities/search`
Search temporary activities.

**Auth:** Admin required

**Query Params:** `q` - Search query

---

#### `POST /api/admin/temporary-activities/send-whatsapp`
Send WhatsApp message for activity.

**Auth:** Admin required

**Request Body:**
```json
{
  "activity_id": 1,
  "message": "Custom message"
}
```

---

### File Upload

#### `POST /api/upload`
Upload file to Cloudflare R2.

**Auth:** Admin required

**Request:** Multipart form data with file

**Response:**
```json
{
  "success": true,
  "url": "https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev/uploads/file.jpg"
}
```

---

### Dashboard & Analytics

#### `GET /api/dashboard/stats`
Get dashboard statistics.

**Response:**
```json
{
  "total_students": 1000,
  "total_courses": 50,
  "total_enrollments": 500,
  "active_users": 200
}
```

---

### Security

#### `GET /api/security/logs`
Get security logs.

**Auth:** Admin required

---

#### `GET /api/security/blocked-ips`
Get blocked IPs.

**Auth:** Admin required

---

### Reports

#### `GET /api/reports/ungrouped-students`
Get ungrouped students report.

**Auth:** Admin required

---

## 🔧 External Services

### Cloudflare R2 (File Storage)

**Configuration:**
- Account ID: `3d1b18c2d945425cecef4f47bedb43c6`
- Bucket: `markano`
- Public URL: `https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev`

**Functions:**
- `uploadToR2(file, fileName, contentType, folder)` - Upload file
- `deleteFromR2(fileUrl)` - Delete file

**Allowed File Types:**
- Images: JPEG, PNG, GIF, WebP, SVG
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Max Size: 10MB

---

### WhatsApp API

**Configuration:**
- API URL: `http://168.231.85.21:3000`
- API Key: `f12a05a88b6243349220b03951b0fb5c`

**Functions:**
- `sendWhatsAppMessage(phoneNumber, message, options)` - Send message
- `sendWelcomeMessage(phoneNumber, studentName, email, password)` - Welcome message
- `sendTrackRequestMessage(phoneNumber, studentName, trackName)` - Track request confirmation
- `sendTrackApprovalMessage(phoneNumber, studentName, trackName)` - Track approval
- `sendProjectMarksMessage(phoneNumber, studentName, activityMarks)` - Project marks
- `sendLowMarksMessage(phoneNumber, studentName, activityMarks)` - Low marks notification

**Phone Number Format:**
- Input: `+252 61 1234567` or `252611234567`
- Output: `252611234567@c.us`

---

### Email Service

**Status:** Placeholder (not fully implemented)

**Functions:**
- `sendRegistrationEmail(email, studentName, password)` - Registration email

**TODO:** Integrate with Resend, SendGrid, or similar service

---

## 🔑 Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Cloudflare R2
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=markano
R2_PUBLIC_URL=https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev

# WhatsApp API
WHATSAPP_API_URL=http://168.231.85.21:3000
WHATSAPP_API_KEY=f12a05a88b6243349220b03951b0fb5c

# Node Environment
NODE_ENV=production|development
```

---

## 📝 Request/Response Patterns

### Standard Success Response

```json
{
  "id": 1,
  "data": "..."
}
```

### Standard Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination (where applicable)

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Authentication Errors

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `429 Too Many Requests` - Rate limit exceeded

---

## 🚀 Database Migrations

All database migrations are located in the `scripts/` directory:

- `001_create_tables.sql` - Initial schema
- `002_seed_initial_data.sql` - Seed data
- `003-create-user-permissions.sql` - User permissions
- `004-create-forum-tables.sql` - Forum tables
- `005-video-class-access.sql` - Video access
- `006-ecommerce-wizard-tables.sql` - E-commerce wizard
- `036-live-coding-challenges.sql` - Live coding
- `045-gamified-learning-path-schema.sql` - Gamified learning
- `047-create-payment-table.sql` - Payments
- `050-create-temporary-activities-table.sql` - Temporary activities
- And more...

Run migrations using:
```bash
node scripts/run-migration.js <migration-file>
```

---

## 🔄 API Versioning

Currently, the API does not use versioning. All endpoints are under `/api/`.

**Future Consideration:** Implement `/api/v1/` prefix for versioning.

---

## 📊 Rate Limits

- **Auth Endpoints:** 5 requests per 15 minutes
- **Registration:** 10 requests per 15 minutes
- **API Endpoints:** 100 requests per minute
- **Public Endpoints:** 200 requests per minute

Exceeding limits results in:
- Temporary IP block (duration varies by endpoint)
- `429 Too Many Requests` response

---

## 🛠️ Development

### Running Locally

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Database Connection

The system uses local PostgreSQL (VPS). Connection is established via `DATABASE_URL` from env:

```typescript
import postgres from "postgres"
const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })
```

All queries use tagged template literals for SQL injection prevention.

---

## 📌 Notes

1. **Token Expiry:** Tokens expire after 8 hours
2. **Password Hashing:** Uses bcryptjs (12 rounds) for new passwords, supports legacy SHA-256
3. **File Uploads:** All files uploaded to Cloudflare R2
4. **Security:** Custom middleware handles all security checks
5. **Error Handling:** All endpoints return consistent error format
6. **CORS:** Handled by Next.js (configure in `next.config.mjs` if needed)

---

## 🔍 Testing

Currently, the API does not have automated tests. Consider adding:

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical flows

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review existing API route implementations
3. Check database schema in `scripts/` directory
4. Review security middleware in `proxy.ts`

---

**Document Version:** 1.0  
**Last Updated:** January 2026
