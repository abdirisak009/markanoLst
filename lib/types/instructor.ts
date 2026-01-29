/**
 * Instructor System – TypeScript interfaces
 */

export type InstructorApplicationStatus = "pending" | "approved" | "rejected" | "changes_requested"
export type InstructorStatus = "active" | "suspended"

export interface InstructorApplication {
  id: number
  full_name: string
  email: string
  phone: string | null
  cv_url: string | null
  cv_file_name: string | null
  proposed_courses: string | null
  bio: string | null
  experience_years: number | null
  status: InstructorApplicationStatus
  rejection_reason: string | null
  changes_requested_message: string | null
  reviewed_at: string | null
  reviewed_by: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Instructor {
  id: number
  application_id: number | null
  full_name: string
  email: string
  phone: string | null
  profile_image_url: string | null
  bio: string | null
  status: InstructorStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface InstructorWithApplication extends Instructor {
  application?: InstructorApplication
  university_name?: string | null
}

export interface InstructorDashboardStats {
  courses_count: number
  enrollments_count: number
  students_count: number
  recent_activity: Array<{ type: string; title: string; at: string }>
}
