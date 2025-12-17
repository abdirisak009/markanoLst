-- Check if product_link column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ecommerce_wizard_submissions' 
AND column_name = 'product_link';

-- If you want to test with an existing submission, update it with a sample link
-- Replace GROUP_ID with your actual group_id (e.g., 76)
UPDATE ecommerce_wizard_submissions 
SET product_link = 'https://www.alibaba.com/product-detail/Sample-Product_123456789.html'
WHERE group_id = 76;

-- Verify the update
SELECT group_id, product_name, product_link 
FROM ecommerce_wizard_submissions 
WHERE group_id = 76;
