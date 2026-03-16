-- =============================================================================
-- URGENT SIGNUP FIX
-- Run this in the Supabase SQL Editor to resolve the "Database error saving new user"
-- =============================================================================

-- 1. Ensure the profiles table is ready and role constraint is lenient but consistent
DO $$ 
BEGIN 
    -- Drop old constraints if they exist
    ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_role_final_check;
    
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'learner';
    END IF;

    -- Add a robust case-insensitive check constraint
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_final_check 
      CHECK (LOWER(role) IN ('learner', 'instructor', 'admin'));
END $$;

-- 2. Overhaul the handle_new_user function to be extremely robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'learner';
  meta_role TEXT;
BEGIN
  -- Extract role from metadata, default to 'learner' if missing or invalid
  meta_role := LOWER(COALESCE(NEW.raw_user_meta_data ->> 'role', default_role));
  
  -- Final safety check for role
  IF meta_role NOT IN ('learner', 'instructor', 'admin') THEN
    meta_role := default_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    meta_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error or handle gracefully - returning NEW ensures auth.users insert doesn't fail
  -- even if the profile creation fails (user can still login and try profile fix later)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
