-- Step 1: Find and display all duplicate payments before cleanup
SELECT 
    student_id, 
    group_id, 
    COUNT(*) as duplicate_count,
    SUM(amount_paid) as total_paid
FROM group_payments
GROUP BY student_id, group_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Remove duplicate payments, keeping only the earliest payment for each student-group combination
DELETE FROM group_payments
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (PARTITION BY student_id, group_id ORDER BY payment_date ASC) as rn
        FROM group_payments
    ) t
    WHERE rn > 1
);

-- Step 3: Add a unique constraint to prevent future duplicates
ALTER TABLE group_payments 
ADD CONSTRAINT unique_student_group_payment 
UNIQUE (student_id, group_id);

-- Step 4: Verify cleanup - this should return no rows
SELECT 
    student_id, 
    group_id, 
    COUNT(*) as payment_count
FROM group_payments
GROUP BY student_id, group_id
HAVING COUNT(*) > 1;
