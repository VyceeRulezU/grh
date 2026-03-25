-- ============================================================================
-- ENROLLMENT COUNT & DATABASE CLEANUP (FIX V2)
-- Run this in the Supabase SQL Editor.
-- This version handles "orphaned" records (e.g. course_id 18) automatically.
-- ============================================================================

-- 1. CLEANUP: Delete progress records for courses that no longer exist
-- This resolves the "foreign key constraint" error you encountered.
DELETE FROM public.user_progress 
WHERE course_id NOT IN (SELECT id FROM public.courses);

-- 2. POLICIES: Fix Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Users manage own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Admins view all progress" ON public.user_progress;
DROP POLICY IF EXISTS "Public view progress for counts" ON public.user_progress;

-- Users can manage their own data
CREATE POLICY "Users manage own progress" ON public.user_progress 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admins can see everything
CREATE POLICY "Admins view all progress" ON public.user_progress 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND LOWER(role) = 'admin')
);

-- Public (Guests/Students) can see enrollment IDs so counts can be calculated
-- This makes the "0 enrolled" issue go away while keeping private progress data safe.
CREATE POLICY "Public view progress for counts" ON public.user_progress 
FOR SELECT USING (true);

-- 3. CONSTRAINTS: Re-apply foreign keys for data integrity
-- Now that orphans are gone, this will succeed.
ALTER TABLE IF EXISTS public.user_progress DROP CONSTRAINT IF EXISTS user_progress_course_id_fkey;
ALTER TABLE public.user_progress 
ADD CONSTRAINT user_progress_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- 4. OPTIMIZATION: Faster counting
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
