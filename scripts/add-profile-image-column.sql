-- Add profile_image column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_users';
