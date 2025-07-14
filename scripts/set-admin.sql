-- Script to set a user as admin
-- Replace 'your-email@example.com' with your actual email address
-- Run this in your Supabase SQL editor after deployment

UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';

-- Verify the admin was set
SELECT email, is_admin, created_at 
FROM profiles 
WHERE is_admin = true; 