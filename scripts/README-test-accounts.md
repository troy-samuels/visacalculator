# Test Accounts Setup Guide

This guide will help you create fake user and admin accounts for testing the Schengen Visa Calculator.

## Quick Setup Method

### Step 1: Create Accounts via Website

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Create Regular User Account:**
   - Go to `http://localhost:3000/signup`
   - Fill in the form:
     - First Name: `John`
     - Last Name: `Doe`
     - Email: `test.user@example.com`
     - Phone: `+1 555-0123`
     - Password: `testuser123`
     - Confirm Password: `testuser123`
   - Click "Create an account"

3. **Create Admin Account:**
   - Go to `http://localhost:3000/signup`
   - Fill in the form:
     - First Name: `Admin`
     - Last Name: `User`
     - Email: `admin@example.com`
     - Phone: `+1 555-0124`
     - Password: `admin123`
     - Confirm Password: `admin123`
   - Click "Create an account"

### Step 2: Set Admin Privileges

1. **Access your Supabase Dashboard:**
   - Go to [supabase.com](https://supabase.com)
   - Login and select your project
   - Go to "SQL Editor"

2. **Run the admin setup script:**
   ```sql
   -- Copy and paste from scripts/set-admin.sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'admin@example.com';
   
   -- Verify it worked
   SELECT email, first_name, last_name, is_admin, created_at 
   FROM profiles 
   WHERE email IN ('admin@example.com', 'test.user@example.com')
   ORDER BY email;
   ```

### Step 3: Add Sample Data (Optional)

1. **Add sample visa entries for the test user:**
   ```sql
   -- Copy and paste from scripts/sample-visa-data.sql
   INSERT INTO visa_entries (user_id, country_code, start_date, end_date, notes) VALUES
   (
     (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
     'FR', '2024-06-01', '2024-06-15', 'Business trip to Paris'
   ),
   (
     (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
     'IT', '2024-07-10', '2024-07-25', 'Vacation in Rome and Florence'
   ),
   (
     (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
     'ES', '2024-08-05', '2024-08-12', 'Conference in Barcelona'
   ),
   (
     (SELECT id FROM profiles WHERE email = 'test.user@example.com' LIMIT 1),
     'DE', '2024-09-20', '2024-09-27', 'Trade show in Berlin'
   );
   ```

## Test Account Details

### 👤 Regular User Account
- **Email:** `test.user@example.com`
- **Password:** `testuser123`
- **Name:** John Doe
- **Home Country:** US
- **Access:** Regular user features, dashboard, visa calculator

### 👑 Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Name:** Admin User
- **Home Country:** US
- **Access:** All user features + admin analytics dashboard (`/admin/analytics`)

## Testing the Accounts

### 1. Test Regular User
1. Go to `http://localhost:3000/login`
2. Login with `test.user@example.com` / `testuser123`
3. You should be redirected to `/dashboard`
4. Test adding visa entries, calculations, etc.

### 2. Test Admin User
1. Go to `http://localhost:3000/login`
2. Login with `admin@example.com` / `admin123`
3. You should be redirected to `/dashboard`
4. Navigate to `/admin/analytics` to test admin features
5. You should see analytics data and admin-only features

## Automated Setup (Alternative Method)

If you prefer to use the automated script:

```bash
# Make the script executable
chmod +x scripts/create-test-accounts.js

# Run the script (requires Node.js with ES modules)
node scripts/create-test-accounts.js
```

Note: The automated script may require additional setup and might not work without the Supabase service role key.

## Troubleshooting

### Account Creation Issues
- **"User already exists":** Delete the existing accounts from Supabase Auth dashboard first
- **Email confirmation required:** Check your Supabase Auth settings to disable email confirmation for development

### Admin Access Issues
- **Can't access `/admin/analytics`:** Verify the `is_admin` flag is set to `true` in the profiles table
- **"Access denied":** Check that you're logged in with the admin account

### Database Issues
- **Visa entries not showing:** Verify the user_id in visa_entries matches the profile id
- **Countries not loading:** Run the `scripts/setup-database.sql` script if you haven't already

## Cleanup

To remove the test accounts:

1. **Delete from Supabase Auth:**
   - Go to Supabase Dashboard > Authentication > Users
   - Delete the test users

2. **Clean up database:**
   ```sql
   DELETE FROM visa_entries WHERE user_id IN (
     SELECT id FROM profiles WHERE email IN ('test.user@example.com', 'admin@example.com')
   );
   DELETE FROM profiles WHERE email IN ('test.user@example.com', 'admin@example.com');
   ```

---

**Happy Testing! 🚀** 