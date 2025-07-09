-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS home_country VARCHAR(2),
ADD COLUMN IF NOT EXISTS travel_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Add foreign key constraint for home_country
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_home_country 
FOREIGN KEY (home_country) REFERENCES countries(code);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_home_country ON profiles(home_country);
