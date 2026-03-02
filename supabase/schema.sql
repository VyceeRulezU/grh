-- =============================================================================
-- Governance Resource Hub — Supabase Schema
-- Run this in the Supabase SQL Editor after project setup.
-- =============================================================================

-- ───────────────────────────────────────────────────────────────────────────────
-- 1. Profiles (extends Supabase auth.users)
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'instructor', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────────────────
-- 2. Courses
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Governance',
  level       TEXT NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner','Medium','Advance','Expert')),
  instructor  TEXT,
  price       NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 3. Course Modules (lessons inside a course)
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_modules (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id   BIGINT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  video_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 4. Library Resources (PERL / SPARC / SLGP)
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resources (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'PERL' CHECK (type IN ('PERL','SPARC','SLGP')),
  category    TEXT NOT NULL DEFAULT 'Governance',
  description TEXT,
  file_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 5. Books
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.books (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  summary     TEXT,
  image_url   TEXT,          -- NULL → frontend uses a default fallback image
  file_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 6. Enrollments (links users to courses)
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enrollments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   BIGINT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress    NUMERIC(5,2) DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments   ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Users can read any profile; only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── Courses ──────────────────────────────────────────────────────────────────
-- Anyone can view published courses
CREATE POLICY "Published courses are viewable"
  ON public.courses FOR SELECT USING (status = 'Published');

-- Admins can do everything
CREATE POLICY "Admins manage courses"
  ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Course Modules ───────────────────────────────────────────────────────────
CREATE POLICY "Modules viewable with course"
  ON public.course_modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND status = 'Published')
  );

CREATE POLICY "Admins manage modules"
  ON public.course_modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Resources ────────────────────────────────────────────────────────────────
CREATE POLICY "Published resources are viewable"
  ON public.resources FOR SELECT USING (status = 'Published');

CREATE POLICY "Admins manage resources"
  ON public.resources FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Books ────────────────────────────────────────────────────────────────────
CREATE POLICY "Published books are viewable"
  ON public.books FOR SELECT USING (status = 'Published');

CREATE POLICY "Admins manage books"
  ON public.books FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Enrollments ──────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
  ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins view all enrollments"
  ON public.enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
