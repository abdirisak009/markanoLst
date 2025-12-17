-- Create user_permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

-- Add status column to admin_users if not exists
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Insert default permissions for reference
-- Permission keys follow pattern: module_action (e.g., students_view, students_edit)
COMMENT ON TABLE user_permissions IS 'Available permissions:
- dashboard_view: View dashboard/overview
- students_view: View all students
- students_edit: Edit/manage students
- penn_students_view: View Penn students
- penn_students_edit: Edit Penn students
- university_students_view: View university students
- university_students_edit: Edit university students
- universities_view: View universities
- universities_edit: Edit universities
- classes_view: View classes
- classes_edit: Edit classes
- courses_view: View courses
- courses_edit: Edit courses
- videos_view: View videos
- videos_edit: Edit videos
- video_analytics_view: View video analytics
- assignments_view: View assignments
- assignments_edit: Edit assignments
- groups_view: View groups
- groups_edit: Edit groups
- group_reports_view: View group reports
- challenges_view: View challenges
- challenges_edit: Edit challenges
- payments_view: View payments
- payments_edit: Edit payments
- expenses_view: View expenses
- expenses_edit: Edit expenses
- financial_report_view: View financial reports
- performance_view: View performance
- analytics_view: View analytics
- approvals_view: View approvals
- approvals_edit: Manage approvals
- qr_codes_view: View QR codes
- qr_codes_edit: Generate QR codes
- users_view: View users
- users_edit: Manage users (admin only)
';

-- Create index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_key ON user_permissions(permission_key);
