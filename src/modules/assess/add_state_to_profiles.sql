-- ================================================
-- Assessment Portal: Add state column to profiles
-- Run in Supabase SQL Editor
-- ================================================

-- 1. Add 'state' column to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT NULL;

-- 2. Add a comment for documentation
COMMENT ON COLUMN public.profiles.state IS 'Nigerian state the user represents (for state assessment portal)';

-- 3. Create an index for efficient state-based lookups
CREATE INDEX IF NOT EXISTS profiles_state_idx ON public.profiles (state);

-- 4. (Optional) Add an enum-style check constraint for valid Nigerian states
-- Uncomment if you want strict validation at DB level:
-- ALTER TABLE public.profiles
--   ADD CONSTRAINT valid_nigerian_state CHECK (
--     state IS NULL OR state IN (
--       'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
--       'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
--       'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
--       'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'
--     )
--   );
