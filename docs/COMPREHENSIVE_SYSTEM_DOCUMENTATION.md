# 📚 Markano Learning Platform - Comprehensive System Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Language:** English / Af-Soomaali

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Installation & Setup](#installation--setup)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Pages & Routes](#frontend-pages--routes)
7. [Features & Modules](#features--modules)
8. [Authentication & Security](#authentication--security)
9. [Configuration](#configuration)
10. [Deployment](#deployment)
11. [Development Guide](#development-guide)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### What is Markano?

Markano is a comprehensive online learning platform designed for educational institutions, students, and instructors. It provides a complete ecosystem for managing courses, students, assignments, payments, and gamified learning experiences.

### Key Capabilities

- **Multi-Institution Support**: Manage multiple universities and classes
- **Student Management**: Penn students, university students, and Gold students
- **Learning Systems**: 
  - Traditional courses with modules and lessons
  - Gamified learning path with XP, levels, and badges
  - Markano Gold premium learning tracks
- **Live Coding Challenges**: Real-time coding competitions
- **E-commerce Wizard**: Group-based e-commerce project management
- **Video Learning**: Video courses with progress tracking
- **Forum**: Discussion boards for students
- **Payment Management**: Group payments and expense tracking
- **Admin Dashboard**: Comprehensive admin panel for system management

---

## 🏗️ Architecture & Technology Stack

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | Node.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL (local on VPS) |
| **Query Builder** | postgres.js (tagged template literals, DATABASE_URL from env) |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Authentication** | Custom token-based system with cookies |
| **UI Framework** | React 19 + Tailwind CSS 4 |
| **UI Components** | Radix UI + shadcn/ui |
| **Code Editor** | Monaco Editor |
| **Form Handling** | React Hook Form + Zod |
| **State Management** | SWR for data fetching |
| **Security** | Custom middleware with rate limiting |

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                       │
│  (Next.js App Router - React Components)                │
├─────────────────────────────────────────────────────────┤
│                    API Layer                            │
│  (Next.js API Routes - /app/api/*)                     │
├─────────────────────────────────────────────────────────┤
│              Security & Authentication                  │
│  (Custom Middleware - Rate Limiting - Token Auth)       │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                       │
│  (PostgreSQL via Neon Serverless)                       │
├─────────────────────────────────────────────────────────┤
│              External Services                          │
│  (Cloudflare R2 - WhatsApp API - Email)                │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
markanoLst/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API route handlers
│   ├── learning/          # Gamified learning pages
│   ├── gold/              # Markano Gold pages
│   ├── videos/            # Video learning pages
│   └── ...                # Other feature pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection
│   ├── auth.ts          # Authentication
│   ├── security.ts      # Security middleware
│   ├── r2-client.ts     # Cloudflare R2 client
│   └── whatsapp.ts      # WhatsApp integration
├── scripts/              # Database migration scripts
├── public/              # Static assets
└── docs/                # Documentation
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: Version 18+ (recommended: 20+)
- **npm** or **pnpm**: Package manager
- **PostgreSQL Database**: Neon Serverless or any PostgreSQL instance
- **Cloudflare R2 Account**: For file storage (optional)
- **WhatsApp API**: For messaging (optional)

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd markanoLst

# Install dependencies
npm install
# OR
pnpm install
```

### Step 2: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Cloudflare R2 (File Storage)
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=markano
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# WhatsApp API (Optional)
WHATSAPP_API_URL=http://your-whatsapp-api-url:3000
WHATSAPP_API_KEY=your_api_key

# Node Environment
NODE_ENV=development
```

### Step 3: Database Setup

Run database migrations in order:

```bash
# Connect to your database
psql $DATABASE_URL

# Or use the migration script
node scripts/run-migration.js scripts/001_create_tables.sql
node scripts/run-migration.js scripts/002_seed_initial_data.sql
node scripts/run-migration.js scripts/003-create-user-permissions.sql
# ... continue with other migrations
```

**Important Migration Files:**
- `001_create_tables.sql` - Core tables
- `002_seed_initial_data.sql` - Initial data
- `045-gamified-learning-path-schema.sql` - Gamified learning system
- `047-create-payment-table.sql` - Payment system
- `036-live-coding-challenges.sql` - Live coding system

### Step 4: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 5: Create Admin User

Access the admin login page and create your first admin user, or insert directly into the database:

```sql
INSERT INTO admin_users (username, password_hash, role, created_at)
VALUES ('admin', 'hashed_password', 'super_admin', NOW());
```

---

## 🗄️ Database Schema

### Core Tables Overview

#### Admin & Users
- **admin_users**: Admin user accounts
- **user_permissions**: Admin user permissions

#### Universities & Classes
- **universities**: University information
- **classes**: Class definitions (penn/university types)
- **penn_students**: Penn student registrations
- **university_students**: University student registrations

#### Courses & Learning
- **courses**: Legacy course catalog
- **modules**: Course modules
- **lessons**: Individual lessons
- **assignments**: Course assignments
- **student_marks**: Student assignment marks
- **student_progress**: Student lesson progress

#### Gamified Learning System
- **learning_courses**: New learning course catalog
- **learning_modules**: Modules within courses
- **learning_lessons**: Individual lessons
- **lesson_quizzes**: Quiz questions per lesson
- **lesson_tasks**: Tasks/reflections per lesson
- **user_lesson_progress**: Individual lesson progress
- **user_course_progress**: Course-level progress
- **user_xp**: XP transaction log
- **user_xp_summary**: Aggregated XP for levels
- **learning_levels**: Level definitions (8 levels)
- **learning_badges**: Badge definitions
- **user_badges**: Earned badges
- **daily_streaks**: Daily activity tracking
- **quiz_submissions**: Quiz answers
- **task_submissions**: Task submissions
- **learning_payments**: Course payment records

#### Markano Gold System
- **gold_students**: Gold student accounts
- **gold_tracks**: Learning tracks/paths
- **gold_levels**: Levels within tracks
- **gold_lessons**: Lessons in gold system
- **gold_enrollments**: Student track enrollments
- **gold_level_requests**: Level advancement requests
- **gold_applications**: Track application requests

#### Videos
- **videos**: Video catalog
- **video_categories**: Video categories
- **video_progress**: Student video watch progress
- **video_analytics**: Video analytics data

#### Groups & E-commerce
- **groups**: Student groups
- **group_members**: Group membership
- **group_payments**: Group payment records
- **group_expenses**: Group expense tracking
- **ecommerce_submissions**: E-commerce project submissions
- **ecommerce_wizard_data**: E-commerce wizard form data

#### Live Coding
- **live_coding_challenges**: Challenge definitions
- **live_coding_participants**: Participant registrations
- **live_coding_teams**: Team formations
- **live_coding_submissions**: Code submissions

#### Forum
- **forum_categories**: Discussion categories
- **forum_topics**: Discussion topics
- **forum_posts**: Post replies

#### Quizzes
- **quizzes**: Quiz definitions
- **quiz_questions**: Quiz questions
- **quiz_submissions**: Student quiz submissions

### Key Relationships

```
universities ──┬── classes
               └── university_students

classes ──┬── assignments
          └── student_marks

learning_courses ──┬── learning_modules
                   └── user_course_progress

learning_modules ─── learning_lessons

learning_lessons ──┬── lesson_quizzes
                   ├── lesson_tasks
                   └── user_lesson_progress

gold_tracks ──┬── gold_levels
              └── gold_enrollments

gold_levels ─── gold_lessons

groups ──┬── group_members
         ├── group_payments
         └── group_expenses
```

---

## 🔌 API Endpoints

### Authentication

#### Admin Authentication

**POST** `/api/admin/auth/login`
- Login admin user
- Returns: `{ token, user }`
- Sets: `admin_token` cookie

**POST** `/api/admin/login`
- Alternative admin login endpoint

#### Gold Student Authentication

**POST** `/api/gold/auth/login`
- Login gold student
- Returns: `{ token, student }`
- Sets: `gold_student_token` cookie

**POST** `/api/gold/auth/register`
- Register new gold student
- Returns: `{ success, student }`

#### Penn Student Authentication

**POST** `/api/penn-auth/login`
- Login penn student

**POST** `/api/penn-auth/register`
- Register penn student

### Admin Endpoints

#### Users Management

**GET** `/api/admin/users`
- Get all admin users
- Auth: Admin required

**GET** `/api/admin/users/[id]`
- Get specific admin user

**POST** `/api/admin/users`
- Create new admin user

**PUT** `/api/admin/users/[id]`
- Update admin user

**DELETE** `/api/admin/users/[id]`
- Delete admin user

#### Students Management

**GET** `/api/admin/gold/students`
- Get all gold students

**GET** `/api/admin/ecommerce-submissions`
- Get e-commerce submissions

**GET** `/api/admin/ecommerce-submissions/[groupId]`
- Get submissions for specific group

**GET** `/api/admin/offline-payments`
- Get offline payment records

**PUT** `/api/admin/offline-payments/[id]/approve`
- Approve offline payment

**PUT** `/api/admin/offline-payments/[id]/reject`
- Reject offline payment

**GET** `/api/admin/enrollments`
- Get all enrollments

**PUT** `/api/admin/enrollments/[id]/approve`
- Approve enrollment

**PUT** `/api/admin/enrollments/[id]/reject`
- Reject enrollment

#### Quizzes Management

**GET** `/api/admin/quizzes`
- Get all quizzes

**POST** `/api/admin/quizzes`
- Create new quiz

**GET** `/api/admin/quizzes/[id]`
- Get specific quiz

**PUT** `/api/admin/quizzes/[id]`
- Update quiz

**DELETE** `/api/admin/quizzes/[id]`
- Delete quiz

#### Temporary Activities

**GET** `/api/admin/temporary-activities`
- Get all temporary activities

**POST** `/api/admin/temporary-activities`
- Create temporary activity

**PUT** `/api/admin/temporary-activities/[id]`
- Update temporary activity

**DELETE** `/api/admin/temporary-activities/[id]`
- Delete temporary activity

### Learning System

#### Courses

**GET** `/api/learning/courses?userId={id}`
- Get all courses with user progress
- Returns: `{ courses: [...], progress: {...} }`

**GET** `/api/learning/courses/[courseId]?userId={id}`
- Get specific course with modules and progress

**POST** `/api/learning/courses`
- Create new course (Admin only)

**PUT** `/api/learning/courses/[courseId]`
- Update course (Admin only)

#### Modules

**GET** `/api/learning/modules?courseId={id}`
- Get modules for a course

**POST** `/api/learning/modules`
- Create new module (Admin only)

#### Lessons

**GET** `/api/learning/lessons?moduleId={id}`
- Get lessons for a module

**GET** `/api/learning/lessons/[lessonId]?userId={id}`
- Get specific lesson with progress and unlock status

**POST** `/api/learning/lessons`
- Create new lesson (Admin only)

#### Progress

**GET** `/api/learning/progress?userId={id}`
- Get user's overall learning progress
- Returns: `{ courses, totalXP, currentLevel, badges, streak }`

**POST** `/api/learning/progress`
- Update lesson progress
- Body: `{ userId, lessonId, status, videoWatched, quizCompleted, taskCompleted }`

#### Quizzes

**GET** `/api/learning/quizzes?lessonId={id}`
- Get quizzes for a lesson

**POST** `/api/learning/quiz/submit`
- Submit quiz answers
- Body: `{ userId, lessonId, answers: [...] }`
- Returns: `{ score, correct, total, xpEarned }`

#### Tasks

**GET** `/api/learning/tasks?lessonId={id}`
- Get tasks for a lesson

**POST** `/api/learning/task/submit`
- Submit task
- Body: `{ userId, lessonId, taskId, submission }`

#### Gamification

**GET** `/api/learning/gamification/xp?userId={id}`
- Get user XP summary

**GET** `/api/learning/gamification/streak?userId={id}`
- Get user daily streak

**GET** `/api/learning/gamification/badges?userId={id}`
- Get user badges

#### Enrollment & Payment

**POST** `/api/learning/enroll`
- Enroll in a course
- Body: `{ userId, courseId }`

**POST** `/api/learning/payment`
- Process course payment
- Body: `{ userId, courseId, paymentMethod, amount }`

### Gold System

**GET** `/api/gold/students?studentId={id}`
- Get gold student profile

**GET** `/api/gold/students/profile?studentId={id}`
- Get detailed profile

**GET** `/api/gold/progress?studentId={id}`
- Get gold student progress

### Videos

**GET** `/api/videos`
- Get all videos

**GET** `/api/videos/[id]`
- Get specific video

**GET** `/api/videos/public`
- Get public videos

**GET** `/api/videos/categories`
- Get video categories

**GET** `/api/videos/progress/[id]?studentId={id}`
- Get video progress

**POST** `/api/videos/progress/[id]`
- Update video progress

**GET** `/api/videos/analytics`
- Get video analytics (Admin)

**GET** `/api/videos/student-progress?studentId={id}`
- Get student's video progress

**POST** `/api/videos/verify-student`
- Verify student access to video

**POST** `/api/videos/skip-event`
- Record video skip event

**GET** `/api/videos/track`
- Get video tracking data

### Groups

**GET** `/api/groups`
- Get all groups

**POST** `/api/groups`
- Create new group

**GET** `/api/groups/[id]`
- Get specific group

**PUT** `/api/groups/[id]`
- Update group

**DELETE** `/api/groups/[id]`
- Delete group

**GET** `/api/groups/[id]/members`
- Get group members

**POST** `/api/groups/[id]/members`
- Add member to group

**DELETE** `/api/groups/[id]/members/[studentId]`
- Remove member from group

**GET** `/api/groups/[id]/payments`
- Get group payments

**POST** `/api/groups/[id]/payments`
- Add group payment

**GET** `/api/groups/[id]/expenses`
- Get group expenses

**POST** `/api/groups/[id]/expenses`
- Add group expense

**GET** `/api/groups/ungrouped-students`
- Get students not in any group

**GET** `/api/groups/students-available`
- Get available students for groups

**POST** `/api/groups/transfer`
- Transfer student between groups

**POST** `/api/groups/leader-verify`
- Verify group leader

### E-commerce Wizard

**POST** `/api/ecommerce-wizard/verify-leader`
- Verify group leader for wizard

**GET** `/api/ecommerce-wizard/groups`
- Get groups for wizard

**POST** `/api/ecommerce-wizard/save`
- Save wizard data

**GET** `/api/ecommerce-wizard/[groupId]`
- Get wizard data for group

**POST** `/api/ecommerce-wizard/submit`
- Submit wizard project

**GET** `/api/ecommerce-wizard/submissions`
- Get all submissions

**POST** `/api/ecommerce-wizard/submission`
- Create submission

**GET** `/api/ecommerce-wizard/admin`
- Get admin wizard data

### Live Coding

**GET** `/api/live-coding/challenges`
- Get all challenges

**POST** `/api/live-coding/challenges`
- Create challenge (Admin)

**GET** `/api/live-coding/challenges/[id]`
- Get specific challenge

**PUT** `/api/live-coding/challenges/[id]`
- Update challenge

**DELETE** `/api/live-coding/challenges/[id]`
- Delete challenge

**GET** `/api/live-coding/challenges/[id]/participants`
- Get challenge participants

**POST** `/api/live-coding/challenges/[id]/participants`
- Add participant

**GET** `/api/live-coding/challenges/[id]/teams`
- Get challenge teams

**POST** `/api/live-coding/challenges/[id]/shuffle`
- Shuffle teams

**GET** `/api/live-coding/challenges/[id]/results`
- Get challenge results

**POST** `/api/live-coding/challenges/[id]/control`
- Control challenge (start/stop)

**POST** `/api/live-coding/join/[accessCode]`
- Join challenge with access code

**POST** `/api/live-coding/submit`
- Submit code solution

**GET** `/api/live-coding/activity`
- Get live coding activity

**GET** `/api/live-coding/participants`
- Get all participants

**PUT** `/api/live-coding/participants/[participantId]/unlock`
- Unlock participant

### Universities & Students

**GET** `/api/universities`
- Get all universities

**POST** `/api/universities`
- Create university (Admin)

**PUT** `/api/universities/[id]`
- Update university

**DELETE** `/api/universities/[id]`
- Delete university

**GET** `/api/penn-students`
- Get all penn students

**POST** `/api/penn-students`
- Create penn student

**POST** `/api/penn-students/bulk-upload`
- Bulk upload penn students

**GET** `/api/university-students`
- Get all university students

**POST** `/api/university-students`
- Create university student

**POST** `/api/university-students/bulk-upload`
- Bulk upload university students

### Classes & Assignments

**GET** `/api/classes`
- Get all classes

**POST** `/api/classes`
- Create class

**GET** `/api/assignments`
- Get all assignments

**POST** `/api/assignments`
- Create assignment

**GET** `/api/student-marks`
- Get student marks

**POST** `/api/student-marks`
- Submit student marks

### Students

**GET** `/api/students/all`
- Get all students

**GET** `/api/students/[studentId]`
- Get specific student

**GET** `/api/students/performance?studentId={id}`
- Get student performance

**GET** `/api/students/group-info?studentId={id}`
- Get student's group info

**GET** `/api/students/available-for-group`
- Get students available for groups

### Courses (Legacy)

**GET** `/api/courses`
- Get all courses

**POST** `/api/courses`
- Create course

### Modules & Lessons

**GET** `/api/modules`
- Get all modules

**GET** `/api/lessons`
- Get all lessons

### Enrollments

**GET** `/api/enrollments`
- Get all enrollments

### Forum

**GET** `/api/forum/categories`
- Get forum categories

**GET** `/api/forum/topics?categoryId={id}`
- Get forum topics

**POST** `/api/forum/topics`
- Create topic

### Quiz System

**GET** `/api/quiz/[code]`
- Get quiz by code

**POST** `/api/quiz/[code]/verify`
- Verify quiz access

**POST** `/api/quiz/[code]/submit`
- Submit quiz

### Financial Reports

**GET** `/api/financial-report`
- Get financial report

**GET** `/api/general-expenses`
- Get general expenses

**POST** `/api/general-expenses`
- Add general expense

### Upload

**POST** `/api/upload`
- Upload file to R2
- Body: FormData with file
- Returns: `{ url, key }`

### Security

**GET** `/api/security/logs`
- Get security logs (Admin)

**GET** `/api/security/blocked-ips`
- Get blocked IPs (Admin)

### Reports

**GET** `/api/reports/ungrouped-students`
- Get ungrouped students report

### Dashboard

**GET** `/api/dashboard/stats`
- Get dashboard statistics

---

## 🎨 Frontend Pages & Routes

### Public Pages

- **/** - Home page
- **/register** - Student registration
- **/student-login** - Student login
- **/courses** - Course catalog
- **/course/[id]** - Course details
- **/videos** - Video library
- **/forum** - Discussion forum

### Admin Pages (`/admin`)

- **/admin/login** - Admin login
- **/admin** - Admin dashboard
- **/admin/students** - All students management
- **/admin/penn-students** - Penn students
- **/admin/university-students** - University students
- **/admin/gold** - Gold students
- **/admin/universities** - Universities management
- **/admin/classes** - Classes management
- **/admin/courses** - Courses management
- **/admin/learning-courses** - Learning courses management
- **/admin/videos** - Videos management
- **/admin/groups** - Groups management
- **/admin/payments** - Payments management
- **/admin/offline-payments** - Offline payments
- **/admin/financial-report** - Financial reports
- **/admin/general-expenses** - General expenses
- **/admin/assignments** - Assignments
- **/admin/quizzes** - Quizzes management
- **/admin/temporary-activities** - Temporary activities
- **/admin/live-coding** - Live coding challenges
- **/admin/challenges** - Challenges
- **/admin/ecommerce-submissions** - E-commerce submissions
- **/admin/enrollments** - Enrollments
- **/admin/analytics** - Analytics
- **/admin/performance** - Performance metrics
- **/admin/users** - Admin users management
- **/admin/video-analytics** - Video analytics
- **/admin/video-behavior** - Video behavior
- **/admin/star-ratings** - Star ratings
- **/admin/qr-codes** - QR codes

### Learning Pages (`/learning`)

- **/learning/dashboard** - Learning dashboard with progress
- **/learning/courses/[courseId]** - Course view with modules
- **/learning/lessons/[lessonId]** - Lesson viewer (video, quiz, task)
- **/learning/badges** - Badges showcase

### Gold Pages (`/gold`)

- **/gold/login** - Gold student login
- **/gold/register** - Gold student registration
- **/gold/dashboard** - Gold dashboard
- **/gold/tracks** - Available tracks
- **/gold/progress** - Progress tracking
- **/gold/profile** - Student profile

### Student Pages (`/student`)

- **/student/dashboard** - Student dashboard
- **/student/courses** - Student courses
- **/student/assignments** - Student assignments
- **/student/profile** - Student profile

### Other Pages

- **/bootcamp** - Bootcamp page
- **/hybrid-learning** - Hybrid learning
- **/self-learning** - Self-learning
- **/live-coding** - Live coding interface
- **/quiz/[code]** - Quiz taking interface
- **/code-practice** - Code practice
- **/check-project-marks** - Project marks checker
- **/ecommerce-wizard** - E-commerce wizard
- **/ecommerce-wizard/[groupId]** - Group wizard
- **/ecommerce-wizard/wizard** - Wizard interface
- **/ecommerce-wizard/admin** - Admin wizard view
- **/leader-select** - Leader selection
- **/penn** - Penn student pages
- **/profile** - User profile

---

## ✨ Features & Modules

### 1. Gamified Learning System

A complete gamified learning experience with:

- **XP System**: Earn XP by completing lessons, quizzes, and tasks
- **Level System**: 8 levels from Beginner to Legend
- **Badge System**: 7 default badges for milestones
- **Daily Streaks**: Track consecutive learning days
- **Progress Tracking**: Visual progress indicators
- **Sequential Unlocking**: Lessons unlock progressively

**XP Sources:**
- Lesson completion: 10 XP (default, configurable)
- Perfect quiz score: +5 XP bonus
- Badge earning: 25-200 XP
- Daily streak: Tracked for badge eligibility

**Levels:**
1. Beginner (0 XP) 🌱
2. Explorer (100 XP) 🔍
3. Learner (250 XP) 📚
4. Student (500 XP) 🎓
5. Scholar (1000 XP) 📖
6. Expert (2000 XP) ⭐
7. Master (4000 XP) 👑
8. Legend (8000 XP) 🏆

**Badges:**
- First Steps 🎯 - First lesson completed
- Module Master 📦 - First module completed
- Course Champion 🏆 - First course completed
- Week Warrior 🔥 - 7-day streak
- Month Master 📅 - 30-day streak
- Quiz Master 🧠 - Perfect quiz scores
- Speed Learner ⚡ - 10 lessons in one day

### 2. Markano Gold System

Premium learning tracks with:
- Track-based learning paths
- Level progression within tracks
- Application and approval system
- Progress tracking
- WhatsApp notifications

### 3. Live Coding Challenges

Real-time coding competitions:
- Challenge creation and management
- Team formation and shuffling
- Code submission system
- Real-time leaderboard
- Access code system
- Time-based challenges

### 4. E-commerce Wizard

Group-based e-commerce project management:
- Multi-step wizard interface
- Group leader verification
- Project submission system
- Admin review and approval
- Product link management

### 5. Video Learning System

Video-based courses with:
- Video catalog and categories
- Progress tracking
- Analytics and behavior tracking
- Student access verification
- Skip event tracking

### 6. Forum System

Discussion boards:
- Categories and topics
- Post replies
- User engagement tracking

### 7. Group Management

Student group system:
- Group creation and management
- Member management
- Payment tracking
- Expense management
- Leader verification
- Student transfer between groups

### 8. Payment System

Comprehensive payment management:
- Course payments
- Group payments
- Offline payment approval
- Payment methods tracking
- Financial reports

### 9. Quiz System

Flexible quiz system:
- Quiz creation and management
- Access code system
- Multiple question types
- Instant feedback
- Score tracking

### 10. Assignment System

Assignment management:
- Assignment creation
- Student submission tracking
- Marks and grading
- Performance analytics

---

## 🔐 Authentication & Security

### Authentication System

The system uses a custom token-based authentication with cookies:

**Token Structure:**
```typescript
{
  id: number,
  username: string,  // or email
  role: string,      // admin, super_admin, gold_student
  exp: number,       // Expiration timestamp
  iat: number,       // Issued at timestamp
  type: string       // admin, gold_student
}
```

**Token Generation:**
- Base64 encoded payload
- HMAC-like signature
- 8-hour expiration

**Cookie Management:**
- `admin_token` - Admin authentication
- `gold_student_token` - Gold student authentication
- HttpOnly, Secure (production), SameSite=Strict

### Security Features

#### Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth endpoints | 5 requests | 15 minutes |
| Registration | 10 requests | 15 minutes |
| API endpoints | 100 requests | 1 minute |
| Public endpoints | 200 requests | 1 minute |

#### IP Blocking

- Automatic IP blocking after failed attempts
- Configurable block duration
- Admin-managed blocked IPs list
- Security logs for all events

#### Input Validation

- SQL injection prevention (tagged template literals)
- XSS protection (input sanitization)
- Suspicious pattern detection
- Request body validation

#### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Password Security

- SHA-256 hashing with secret key
- Legacy password support
- Bcryptjs for new passwords (12 rounds)

---

## ⚙️ Configuration

### Environment Variables

**Required:**
```env
DATABASE_URL=postgresql://...
```

**Optional:**
```env
# Cloudflare R2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=markano
R2_ENDPOINT=...
R2_PUBLIC_URL=...

# WhatsApp API
WHATSAPP_API_URL=...
WHATSAPP_API_KEY=...

# Node Environment
NODE_ENV=development|production
```

### Next.js Configuration

**next.config.mjs:**
```javascript
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone'
}
```

### Database Configuration

- Connection via Neon Serverless
- Tagged template literals for queries
- Automatic connection pooling
- SSL required in production

---

## 🚢 Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
services:
  markano-app:
    build: .
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    env_file:
      - .env
```

**Deploy:**
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure cookies
- [ ] Set up SSL/TLS
- [ ] Configure database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting
- [ ] Set up error tracking

---

## 💻 Development Guide

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Code Structure

**API Routes:**
- Located in `app/api/`
- Use Next.js App Router
- Export HTTP method handlers (GET, POST, PUT, DELETE)

**Components:**
- Located in `components/`
- Use React 19
- Styled with Tailwind CSS
- UI components from shadcn/ui

**Utilities:**
- Database: `lib/db.ts`
- Authentication: `lib/auth.ts`
- Security: `lib/security.ts`
- R2 Client: `lib/r2-client.ts`
- WhatsApp: `lib/whatsapp.ts`

### Database Migrations

**Run Migration:**
```bash
node scripts/run-migration.js scripts/001_create_tables.sql
```

**Create New Migration:**
1. Create SQL file in `scripts/`
2. Use numbered prefix (e.g., `054-new-feature.sql`)
3. Test locally first
4. Document changes

### Adding New Features

1. **Database Schema:**
   - Create migration script
   - Run migration
   - Update documentation

2. **API Endpoint:**
   - Create route in `app/api/`
   - Add authentication/authorization
   - Implement validation
   - Add error handling

3. **Frontend:**
   - Create page/component
   - Add routing
   - Connect to API
   - Add error handling

4. **Testing:**
   - Test locally
   - Test with different user roles
   - Test error cases
   - Update documentation

### Best Practices

- Use TypeScript for type safety
- Validate all inputs
- Use tagged template literals for SQL
- Handle errors gracefully
- Log security events
- Follow RESTful conventions
- Document API endpoints
- Use environment variables for secrets
- Implement rate limiting
- Sanitize user inputs

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem:** Cannot connect to database

**Solutions:**
1. Check `DATABASE_URL` in `.env.local`
2. Verify database is running
3. Check SSL mode settings
4. Verify network connectivity

#### Authentication Issues

**Problem:** Token not working

**Solutions:**
1. Check cookie settings (HttpOnly, Secure)
2. Verify token expiration
3. Clear cookies and re-login
4. Check token signature

#### File Upload Issues

**Problem:** Files not uploading to R2

**Solutions:**
1. Verify R2 credentials
2. Check file size limits (10MB)
3. Verify file type is allowed
4. Check R2 bucket permissions

#### Rate Limiting

**Problem:** Getting 429 errors

**Solutions:**
1. Wait for rate limit window to reset
2. Check IP blocking status
3. Contact admin to unblock IP
4. Review security logs

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
```

Check security logs:
```bash
# Via API
GET /api/security/logs

# Check blocked IPs
GET /api/security/blocked-ips
```

### Support

For issues and questions:
1. Check documentation
2. Review error logs
3. Check security logs
4. Contact system administrator

---

## 📝 Additional Resources

### Documentation Files

- `docs/BACKEND_DOCUMENTATION.md` - Detailed API documentation
- `docs/GAMIFIED_LEARNING_PATH.md` - Gamification system details
- `docs/LEARNING_PATH_IMPLEMENTATION.md` - Learning system implementation
- `docs/LEARNING_SYSTEM_SETUP.md` - Setup guide
- `docs/GAMIFICATION_FEATURES_SUMMARY.md` - Gamification features
- `docs/MARKAANO_GOLD_IMPLEMENTATION.md` - Gold system details

### Database Migrations

All migration scripts are in `scripts/` directory. Run them in numerical order.

### External Services

- **PostgreSQL**: Local on VPS (DATABASE_URL=postgresql://markano_user:PASSWORD@localhost:5432/markano)
- **Cloudflare R2**: https://developers.cloudflare.com/r2
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Contributors

Markano Development Team

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Status:** Production Ready
