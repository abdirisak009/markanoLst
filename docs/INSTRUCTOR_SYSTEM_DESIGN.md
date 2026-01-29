# Markano Professional Teacher / Instructor System – System Design

## 1. Overview

The Instructor System allows teachers to self-register, be reviewed by admin, and after approval access a Teacher Dashboard to create and manage courses, assignments, videos, and (when linked to a university) their own students and classes.

### Roles

| Role | Description |
|------|-------------|
| **admin** | Full access; reviews instructor applications; manages instructors |
| **teacher** | Approved instructor; owns courses; can manage own content and (if university-linked) own students |
| **gold_student** | Student on learning platform (unchanged) |
| **student** | University/Penn student (unchanged) |

### Lifecycle

1. **Apply** → Teacher fills public form (personal details, CV upload, proposed courses).
2. **Review** → Admin sees application, can Approve / Reject / Request changes.
3. **Approved** → Instructor account created; teacher can log in.
4. **Dashboard** → Teacher manages courses, assignments, videos; if university-linked, bulk upload students, assign to classes, track performance.

---

## 2. Database Schema

### Core Tables

- **instructors** – Approved teachers (after application approval). Stores email, password_hash, full_name, phone, status (active/suspended), university_id (optional), created_at, updated_at, deleted_at (soft delete).
- **instructor_applications** – Applications before approval. full_name, email, phone, cv_url, proposed_courses (text/json), status (pending/approved/rejected/changes_requested), rejection_reason, reviewed_at, reviewed_by, created_at, updated_at.
- **instructor_documents** – Documents per instructor (CV, etc.). instructor_id, document_type (cv, agreement), file_url, file_name, created_at.
- **instructor_university_links** – Links teacher to university. instructor_id, university_id, role, is_primary, created_at.
- **instructor_activity_logs** – Audit log. instructor_id, action, entity_type, entity_id, metadata (jsonb), ip, created_at.

### Integration with Existing Tables

- **learning_courses** – Add `instructor_id INTEGER REFERENCES instructors(id)` (nullable). Existing courses keep instructor_id NULL.
- **universities** – Already exists; instructor_university_links references it.
- **university_students** – Existing; teachers with university link see only students of their university/classes (enforced in API).

### Status Enums

- **instructor_applications.status**: `pending` | `approved` | `rejected` | `changes_requested`
- **instructors.status**: `active` | `suspended`

### Indexes

- instructors: email (unique), status, university_id (via link table)
- instructor_applications: status, email, created_at
- instructor_documents: instructor_id, document_type
- instructor_university_links: instructor_id, university_id
- instructor_activity_logs: instructor_id, created_at

---

## 3. Auth & Permissions

### New Token Type: `instructor`

- **Cookie**: `instructor_token` (httpOnly, sameSite, 8h).
- **Payload**: `{ id, email, name, type: "instructor", exp, iat }`.
- **Verification**: Same pattern as gold_student (signature + expiry + type).

### Permission Rules

- **Public (no auth)**: `POST /api/instructor/apply`, `GET /api/instructor/apply` (form), `GET /instructor/login`, `POST /api/instructor/auth/login`.
- **Instructor (teacher token)**:
  - Own profile and dashboard.
  - CRUD own courses (learning_courses where instructor_id = me).
  - CRUD own modules/lessons for own courses.
  - Upload videos for own courses.
  - Create assignments/quizzes for own courses.
  - If university-linked: list/upload students for their university, assign to classes, view submissions/marks.
- **Admin**: List/approve/reject applications; list/suspend instructors; override any instructor content if needed (existing admin routes).

### Middleware (proxy.ts)

- Allow `/instructor/apply`, `/instructor/login`, `/api/instructor/apply`, `/api/instructor/auth/login` without instructor token.
- Protect `/api/instructor/*` (except apply and auth/login) with instructor token.
- Protect `/admin/instructors`, `/api/admin/instructor-applications`, `/api/admin/instructors/*` with admin token.

---

## 4. API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/instructor/apply | Submit application (body: full_name, email, phone, password, cv_url, proposed_courses, etc.) |
| POST | /api/instructor/auth/login | Login (email, password) → returns instructor + token; sets cookie |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/instructor-applications | List applications (filter by status) |
| GET | /api/admin/instructor-applications/[id] | Get one application + documents |
| PUT | /api/admin/instructors/[id]/approve | Approve application → create instructor, set application status |
| PUT | /api/admin/instructors/[id]/reject | Reject application (body: rejection_reason) |
| PUT | /api/admin/instructors/[id]/request-changes | Set status to changes_requested (body: message) |
| GET | /api/admin/instructors | List approved instructors |
| GET | /api/admin/instructors/[id] | Get instructor + courses + university link |
| PUT | /api/admin/instructors/[id]/suspend | Suspend instructor (status = suspended) |

### Instructor (teacher token required)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/instructor/dashboard | Stats: my courses, enrollments, recent activity |
| GET | /api/instructor/profile | My profile |
| PUT | /api/instructor/profile | Update my profile |
| GET | /api/instructor/courses | List my courses (learning_courses where instructor_id = me) |
| POST | /api/instructor/courses | Create course (instructor_id set to me) |
| GET | /api/instructor/courses/[id] | Get my course (404 if not owner) |
| PUT | /api/instructor/courses/[id] | Update my course |
| GET | /api/instructor/students | List students (if university-linked: university_students for my university; else students enrolled in my courses) |
| POST | /api/instructor/students/bulk-upload | CSV/Excel upload (university mode only) |
| GET | /api/instructor/analytics | Enrollments, completion rate, revenue (if applicable) |

---

## 5. Frontend Pages

### Public

- **/instructor/apply** – Application form (full_name, email, phone, password, CV upload, proposed courses text).
- **/instructor/login** – Login form (email, password) → redirect to /instructor/dashboard.

### Instructor (layout: sidebar + instructor nav)

- **/instructor/dashboard** – Overview (stats, recent courses, quick actions).
- **/instructor/courses** – List my courses; link to create/edit.
- **/instructor/courses/[id]** – Edit course, modules, lessons.
- **/instructor/assignments** – List/create assignments for my courses.
- **/instructor/students** – List students (university or course enrollments).
- **/instructor/videos** – List/upload videos for my courses.
- **/instructor/analytics** – Charts (enrollments, completion, revenue).

### Admin

- **/admin/instructor-applications** – Table of applications; filters (pending/approved/rejected); actions: Approve, Reject, Request changes.
- **/admin/instructors** – List approved instructors; link to profile; suspend.
- **/admin/instructors/[id]** – Instructor detail (profile, courses, documents, activity log).

---

## 6. Security Considerations

- **CV/document upload**: Store in MinIO or existing upload pipeline; only allow PDF/DOC; virus scan in production.
- **Password**: Hash with same strategy as admin (e.g. bcrypt or existing hashPassword).
- **Rate limiting**: Apply and login endpoints rate-limited (existing proxy).
- **Authorization**: Every instructor API must verify `instructor_token` and ensure resource ownership (instructor_id = token.id) or university scope.
- **Audit**: Log sensitive actions (login, approve, reject, suspend) in instructor_activity_logs or admin logs.

---

## 7. Future Enhancements (Bonus)

- **Revenue sharing**: Store revenue_share_percent per instructor; compute payouts from course_payments.
- **Instructor rating**: Table instructor_ratings (user_id, instructor_id, course_id, rating, review); show average on profile.
- **Contract/agreement**: instructor_documents type `agreement`; require acceptance before first course publish.
- **AI-assisted review**: Optional step in admin review (e.g. summarize CV, flag missing fields).
- **Leaderboard**: Public page or admin view by enrollments/revenue/rating.
- **Certification**: Issue certificates to students who complete instructor’s course (reuse or extend existing certificate flow).

---

## 8. File Structure (New/Modified)

```
app/
  instructor/
    apply/page.tsx
    login/page.tsx
    layout.tsx
    dashboard/page.tsx
    courses/page.tsx
    courses/[id]/page.tsx
    assignments/page.tsx
    students/page.tsx
    videos/page.tsx
    analytics/page.tsx
  admin/
    instructor-applications/page.tsx
    instructors/page.tsx
    instructors/[id]/page.tsx
api/
  instructor/
    apply/route.ts
    auth/login/route.ts
    dashboard/route.ts
    profile/route.ts
    courses/route.ts
    courses/[id]/route.ts
    students/route.ts
    students/bulk-upload/route.ts
    analytics/route.ts
  admin/
    instructor-applications/route.ts
    instructor-applications/[id]/route.ts
    instructors/route.ts
    instructors/[id]/route.ts
    instructors/[id]/approve/route.ts
    instructors/[id]/reject/route.ts
    instructors/[id]/request-changes/route.ts
    instructors/[id]/suspend/route.ts
lib/
  auth.ts          (+ instructor token)
  types/
    instructor.ts  (optional)
scripts/
  058-instructor-system.sql
proxy.ts           (+ instructor routes)
```

This document is the single source of truth for the Instructor System design. Implementation follows the same patterns as existing Markano auth, API, and UI.
