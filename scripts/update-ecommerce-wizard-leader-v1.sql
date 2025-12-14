-- Update the ecommerce_wizard_submissions table to use leader_id instead of group_id

-- Add new leader_id column
ALTER TABLE ecommerce_wizard_submissions
ADD COLUMN leader_id VARCHAR(50);

-- Copy group_id data to leader_id if needed (for existing records)
UPDATE ecommerce_wizard_submissions
SET leader_id = group_id
WHERE leader_id IS NULL;

-- The group_id column can remain for backward compatibility or be removed later
-- To remove it, uncomment the following line:
-- ALTER TABLE ecommerce_wizard_submissions DROP COLUMN group_id;
