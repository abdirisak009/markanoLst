# Interactive Gamified Learning Path - Feature Documentation

## 🎯 Overview

This feature transforms the Markano learning experience into an engaging, gamified journey that motivates students through visual progress, XP points, levels, badges, and daily streaks.

---

## 📐 Architecture

### System Flow

```
Student Dashboard → Course Selection → Module View → Lesson → Video → Quiz → Task → Completion
                                                                    ↓
                                                          XP Award → Level Up → Badge Check
```

### Key Components

1. **Database Layer**: 15 normalized tables with proper relationships
//
2. **API Layer**: RESTful endpoints for all operations
3. **Frontend Layer**: React components with real-time progress tracking
4. **Gamification Engine**: Automatic XP, level, and badge calculation//

---

## 🗄️ Database Schema

### Core Tables

#### `learning_courses`
- Main course container
- Fields: title, slug, description, instructor, duration, difficulty
- Indexes: slug (unique), is_active, order_index

#### `learning_modules`
- Modules within courses
- Fields: course_id (FK), title, description, order_index
- Indexes: course_id, (course_id, order_index) unique

#### `learning_lessons`
- Individual lessons with sequential unlocking
- Fields: module_id (FK), title, video_url, xp_reward, order_index
- Indexes: module_id, (module_id, order_index) unique

#### `lesson_quizzes`
- Quick quizzes (1-3 questions) per lesson
- Fields: lesson_id (FK), question, options (JSONB), correct_answer, explanation
- Supports: multiple_choice, true_false, short_answer

#### `lesson_tasks`
- Mini tasks or reflections
- Fields: lesson_id (FK), task_type, title, instructions
- Types: reflection, practice, submission

### Progress Tracking

#### `user_lesson_progress`
- Tracks individual lesson completion
- Fields: user_id, lesson_id, status, video_watched, quiz_completed, task_completed
- Status: not_started → in_progress → completed

#### `user_course_progress`
- Aggregated course-level progress
- Fields: user_id, course_id, progress_percentage, current_lesson_id
- Auto-calculated from lesson progress

### Gamification

#### `user_xp`
- Transaction log of all XP earned
- Fields: user_id, xp_amount, source_type, source_id, description
- Sources: lesson_completion, quiz_perfect, badge, daily_streak

#### `user_xp_summary`
- Aggregated XP for quick level calculation
- Fields: user_id (PK), total_xp, current_level, xp_to_next_level
- Updated on every XP award

#### `learning_levels`
- Level definitions with XP thresholds
- Pre-populated: 8 levels (Beginner → Legend)
- Fields: level_number, level_name, xp_required, badge_icon

#### `learning_badges`
- Badge definitions
- Pre-populated: 7 default badges
- Fields: badge_key (unique), badge_name, badge_icon, xp_reward

#### `user_badges`
- User badge achievements
- Fields: user_id, badge_id, earned_at
- Unique constraint: (user_id, badge_id)

#### `daily_streaks`
- Daily learning activity tracking
- Fields: user_id, streak_date, lessons_completed, xp_earned
- Used for streak calculation and badge awarding

---

## 🔌 API Endpoints

### Courses

#### `GET /api/learning/courses?userId={id}`
- Returns all active courses with user progress
- Response includes: course details, modules_count, lessons_count, progress object

#### `GET /api/learning/courses/[courseId]?userId={id}`
- Returns course with full module/lesson structure
- Includes user progress for each lesson
- Response: course, modules[], lessons[], progress

#### `POST /api/learning/courses`
- Create new course (admin only)
- Body: title, slug, description, instructor_name, etc.

### Lessons

#### `GET /api/learning/lessons/[lessonId]?userId={id}`
- Returns lesson with quizzes and tasks
- Includes user progress and submissions
- Checks if lesson is unlocked (previous lesson completed)

### Progress

#### `POST /api/learning/progress`
- Update lesson progress
- Body: user_id, lesson_id, video_watched, quiz_completed, task_completed
- Automatically:
  - Awards XP on completion
  - Updates course progress
  - Recalculates level
  - Updates daily streak

### Quiz

#### `POST /api/learning/quiz/submit`
- Submit quiz answer
- Body: user_id, quiz_id, user_answer
- Returns: is_correct, explanation, quiz_score
- Awards bonus XP for perfect scores

### Task

#### `POST /api/learning/task/submit`
- Submit task (reflection, practice)
- Body: user_id, task_id, submission_content
- Updates lesson progress

### Gamification

#### `GET /api/learning/gamification/xp?userId={id}`
- Returns: total_xp, current_level, xp_to_next_level, level_info, recent_xp

#### `GET /api/learning/gamification/badges?userId={id}`
- Returns: earned badges, all badges with earned status

#### `GET /api/learning/gamification/streak?userId={id}`
- Returns: today_completed, current_streak, recent_streaks

#### `POST /api/learning/gamification/streak`
- Update daily streak (called on lesson completion)
- Awards streak badges automatically

---

## 🎨 Frontend Components

### 1. Learning Dashboard (`/learning/dashboard`)

**Features:**
- Course grid with progress bars
- XP & Level card with progress
- Daily streak indicator
- Badges summary
- "Continue Learning" CTA

**Key UI Elements:**
- Visual progress indicators
- Course cards with completion status
- Quick stats (XP, streak, badges)

### 2. Course Page (`/learning/courses/[courseId]`)

**Features:**
- Module/lesson structure visualization
- Sequential unlocking logic
- Progress tracking per lesson
- Current lesson highlighting

**Unlocking Logic:**
- First lesson of first module: Always unlocked
- Subsequent lessons: Previous lesson must be completed
- Cross-module: Last lesson of previous module must be completed

### 3. Lesson Page (`/learning/lessons/[lessonId]`)

**Features:**
- Step-by-step flow: Video → Quiz → Task
- Progress indicator at top
- Video player (iframe support)
- Interactive quiz with instant feedback
- Task submission (reflection/practice)
- Completion animation

**Flow:**
1. Watch video → Mark as watched
2. Complete quiz → Get instant feedback
3. Submit task → Complete lesson
4. Award XP → Show animation → Redirect

---

## 🎮 Gamification System

### XP Points

**Sources:**
- Lesson completion: 10 XP (default, configurable per lesson)
- Perfect quiz score: +5 XP bonus
- Badge earning: Variable (25-200 XP)
- Daily streak: Tracked but no direct XP

**Calculation:**
- Stored in `user_xp` (transaction log)
- Aggregated in `user_xp_summary`
- Updated in real-time

### Levels

**8 Pre-defined Levels:**
1. Beginner (0 XP)
2. Explorer (100 XP)
3. Learner (250 XP)
4. Student (500 XP)
5. Scholar (1000 XP)
6. Expert (2000 XP)
7. Master (4000 XP)
8. Legend (8000 XP)

**Auto-calculation:**
- Triggered on XP award
- Finds highest level where `xp_required <= total_xp`
- Calculates XP to next level

### Badges

**Default Badges:**
- `first_lesson`: First Steps (25 XP)
- `first_module`: Module Master (50 XP)
- `first_course`: Course Complete (100 XP)
- `week_streak`: Week Warrior (75 XP)
- `month_streak`: Monthly Master (200 XP)
- `quiz_master`: Quiz Master (75 XP)
- `speed_learner`: Speed Learner (100 XP)

**Auto-awarding:**
- Checked after lesson/course completion
- Service: `lib/learning/badge-service.ts`
- Awards XP when badge earned

### Daily Streaks

**Tracking:**
- Recorded in `daily_streaks` table
- One row per user per day
- Tracks: lessons_completed, xp_earned

**Calculation:**
- Current streak = consecutive days with activity
- Calculated from most recent date backwards
- Awards badges at 7 and 30 days

---

## 🔄 Business Logic

### Sequential Unlocking

```typescript
// Lesson is unlocked if:
1. It's the first lesson of the first module, OR
2. Previous lesson in same module is completed, OR
3. Last lesson of previous module is completed
```

### Progress Calculation

```typescript
// Course progress = (completed_lessons / total_lessons) * 100
// Updated automatically when lesson status changes
// Current lesson = first incomplete lesson in order
```

### XP & Level Updates

```typescript
// On lesson completion:
1. Award lesson XP
2. Update user_xp_summary.total_xp
3. Recalculate level (find highest level where xp_required <= total_xp)
4. Calculate xp_to_next_level
5. Check for badge eligibility
```

---

## 🚀 Implementation Steps

### 1. Database Setup

```bash
# Run the migration script
psql $DATABASE_URL -f scripts/045-gamified-learning-path-schema.sql
```

### 2. Integration Points

**User Authentication:**
- Update API routes to use your existing user system
- Currently expects `userId` from query params
- Adjust based on your auth middleware

**Navigation:**
- Add link to `/learning/dashboard` in your main navigation
- Update student dashboard to include learning path

### 3. Admin Features (Future)

Create admin pages for:
- Course creation/editing
- Module/lesson management
- Quiz/task creation
- Badge management
- Analytics dashboard

---

## 🎯 Edge Cases & Best Practices

### Edge Cases Handled

1. **Concurrent Progress Updates**
   - Uses `ON CONFLICT` for upserts
   - Prevents duplicate XP awards

2. **Level Calculation**
   - Handles users at max level (no next level)
   - Gracefully handles missing level data

3. **Unlocking Logic**
   - Handles empty modules
   - Handles single-lesson modules
   - Prevents access to locked lessons

4. **Badge Duplication**
   - Unique constraint prevents duplicate badges
   - Checks before awarding

### Best Practices

1. **Performance**
   - Indexes on all foreign keys
   - Indexes on frequently queried fields
   - Aggregated XP summary for quick level lookup

2. **Scalability**
   - JSONB for flexible quiz options
   - Normalized structure for easy expansion
   - Transaction log (user_xp) for audit trail

3. **User Experience**
   - Instant feedback on quiz answers
   - Visual progress indicators
   - Clear unlocking requirements
   - Completion animations

4. **Data Integrity**
   - Foreign key constraints
   - Unique constraints where needed
   - Cascade deletes for cleanup

---

## 📊 Analytics Opportunities

Track:
- Course completion rates
- Average time per lesson
- Quiz success rates
- XP distribution
- Badge earning patterns
- Streak retention

---

## 🔮 Future Enhancements

1. **Social Features**
   - Leaderboards
   - Study groups
   - Peer reviews

2. **Advanced Gamification**
   - Challenges
   - Competitions
   - Custom badges

3. **Adaptive Learning**
   - Difficulty adjustment
   - Personalized paths
   - Recommendation engine

4. **Content Management**
   - Rich text editor
   - Video upload
   - Interactive content

---

## 🐛 Troubleshooting

### Common Issues

1. **Lessons not unlocking**
   - Check previous lesson status
   - Verify order_index values
   - Check is_active flags

2. **XP not updating**
   - Verify lesson completion status
   - Check user_xp_summary exists
   - Review API error logs

3. **Badges not awarding**
   - Check badge-service.ts logic
   - Verify badge_key matches
   - Review user_badges table

---

## 📝 Notes

- All timestamps use PostgreSQL `CURRENT_TIMESTAMP`
- User ID integration needs adjustment based on your auth system
- Video URLs support: YouTube, Vimeo, direct MP4, Cloudflare Stream
- Quiz supports multiple question types (extendable)
- Badge system is extensible (add more badges easily)

---

**Built with production-ready architecture. Scalable, maintainable, and engaging.**
