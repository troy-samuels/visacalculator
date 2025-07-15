-- Sample visa entries for test user
-- Run this after creating the test accounts and signing in as test.user@example.com
-- You'll need to replace USER_ID_HERE with the actual UUID from the profiles table

-- First, get the user ID for test.user@example.com
-- SELECT id FROM profiles WHERE email = 'test.user@example.com';

-- Sample visa entries (replace USER_ID_HERE with the actual UUID)
INSERT INTO visa_entries (user_id, country_code, start_date, end_date, notes) VALUES
(
  (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
  'FR', 
  '2024-06-01', 
  '2024-06-15', 
  'Business trip to Paris'
),
(
  (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
  'IT', 
  '2024-07-10', 
  '2024-07-25', 
  'Vacation in Rome and Florence'  
),
(
  (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
  'ES', 
  '2024-08-05', 
  '2024-08-12', 
  'Conference in Barcelona'
),
(
  (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
  'DE', 
  '2024-09-20', 
  '2024-09-27', 
  'Trade show in Berlin'
);

-- Verify the entries were created
SELECT 
  ve.country_code,
  ve.start_date,
  ve.end_date,
  ve.days,
  ve.notes,
  c.name as country_name,
  c.flag
FROM visa_entries ve
JOIN countries c ON ve.country_code = c.code
JOIN profiles p ON ve.user_id = p.id
WHERE p.email = 'test.user@example.com'
ORDER BY ve.start_date; 