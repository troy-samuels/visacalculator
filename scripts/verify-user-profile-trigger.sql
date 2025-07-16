-- Verify that the user profile creation trigger is working
-- This script checks if the trigger exists and recreates it if needed

-- Check if the function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
    ) THEN
        -- Create the function if it doesn't exist
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $func$
        BEGIN
          INSERT INTO profiles (id, email, first_name, last_name, phone, country_code)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.raw_user_meta_data->>'country_code', '+1')
          );
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE 'Created handle_new_user function';
    END IF;
END
$$;

-- Check if the trigger exists and create it if needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        -- Create the trigger
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
          
        RAISE NOTICE 'Created on_auth_user_created trigger';
    ELSE
        RAISE NOTICE 'Trigger on_auth_user_created already exists';
    END IF;
END
$$;

-- Test the profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
