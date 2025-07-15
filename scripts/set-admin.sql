-- Script to set users as admin
-- Run this in your Supabase SQL editor after creating the test accounts

-- Set admin@example.com as admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';

-- Verify the admin was set
SELECT email, first_name, last_name, is_admin, created_at 
FROM profiles 
WHERE email IN ('admin@example.com', 'test.user@example.com')
ORDER BY email;

-- If you need to set a different email as admin, replace 'your-email@example.com' below:
-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE email = 'your-email@example.com'; 