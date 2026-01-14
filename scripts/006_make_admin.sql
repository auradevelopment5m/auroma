-- Run this script to make a user an admin
-- Replace 'user-email@example.com' with the actual email of the user you want to make admin

-- First, find the user by email in auth.users (this query is for reference)
-- SELECT id, email FROM auth.users WHERE email = 'user-email@example.com';

-- Then update their profile to be admin
-- UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';

-- Alternative: Make a user admin by their email (requires the user to have signed up first)
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'ahmad23slieman@gmail.com'
);
