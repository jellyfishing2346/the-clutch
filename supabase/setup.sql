-- =============================================
-- Clutch — Complete Database Setup
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.
-- =============================================

-- ─── EXTENSIONS ───────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────
DO $$ BEGIN
  CREATE TYPE trust_level AS ENUM ('new', 'established', 'trusted', 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_category AS ENUM (
    'simple_help', 'errands', 'delivery', 'moving',
    'cleaning', 'cooking', 'pet_care', 'tech_help',
    'repairs', 'tutoring', 'skilled', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('cash', 'credits', 'exchange', 'free');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE credits_tx_type AS ENUM ('earned', 'spent', 'bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── USER PROFILES ───────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  bio             TEXT,
  neighborhood    TEXT,
  borough         TEXT,
  credits_balance INTEGER NOT NULL DEFAULT 20 CHECK (credits_balance >= 0),
  trust_level     trust_level NOT NULL DEFAULT 'new',
  rating_avg      NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count    INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_posted    INTEGER NOT NULL DEFAULT 0,
  languages       TEXT[] NOT NULL DEFAULT '{"en"}',
  skills          TEXT[] NOT NULL DEFAULT '{}',
  is_id_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safety net for existing tables created before `skills` was added here —
-- CREATE TABLE IF NOT EXISTS above is a no-op on an existing table, so this
-- is what actually adds the column if it's missing from a prior deployment.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}';

-- ─── TASKS ───────────────────────────────────
-- location stored as JSONB { "lat": number, "lng": number }

CREATE TABLE IF NOT EXISTS public.tasks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  description          TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 600),
  category             task_category NOT NULL,
  required_trust_level trust_level NOT NULL DEFAULT 'new',
  location             JSONB,
  address              TEXT NOT NULL DEFAULT '',
  neighborhood         TEXT NOT NULL DEFAULT '',
  borough              TEXT NOT NULL DEFAULT '',
  payment_type         payment_type NOT NULL,
  payment_amount       NUMERIC(10,2),
  credits_amount       INTEGER,
  status               task_status NOT NULL DEFAULT 'open',
  applicant_count      INTEGER NOT NULL DEFAULT 0,
  scheduled_for        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_status_idx    ON public.tasks (status);
CREATE INDEX IF NOT EXISTS tasks_creator_idx   ON public.tasks (creator_id);
CREATE INDEX IF NOT EXISTS tasks_category_idx  ON public.tasks (category);
CREATE INDEX IF NOT EXISTS tasks_borough_idx   ON public.tasks (borough);

-- ─── TASK APPLICATIONS ───────────────────────

CREATE TABLE IF NOT EXISTS public.task_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message      TEXT,
  status       application_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS applications_task_idx      ON public.task_applications (task_id);
CREATE INDEX IF NOT EXISTS applications_applicant_idx ON public.task_applications (applicant_id);

-- ─── REVIEWS ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS reviews_reviewee_idx ON public.reviews (reviewee_id);

-- ─── CREDITS TRANSACTIONS ─────────────────────

CREATE TABLE IF NOT EXISTS public.credits_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        credits_tx_type NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  task_id     UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credits_user_idx ON public.credits_transactions (user_id);

-- ─── CONVERSATIONS & MESSAGES ─────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  participant_ids UUID[] NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages (conversation_id, created_at DESC);

-- ─── AVATAR STORAGE ───────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
CREATE POLICY "avatars_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ─── FUNCTIONS & TRIGGERS ────────────────────

-- Auto-create profile + welcome bonus on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, borough, neighborhood, credits_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'borough',
    NEW.raw_user_meta_data->>'neighborhood',
    20
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.credits_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 20, 'bonus', 'Welcome to clutch! Here are 20 credits to get started.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update user rating after each review
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles SET
    rating_avg   = (SELECT AVG(rating)::NUMERIC(3,2) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
    updated_at   = NOW()
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_rating ON public.reviews;
CREATE TRIGGER trg_update_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- Increment applicant count when application is submitted
CREATE OR REPLACE FUNCTION public.increment_applicant_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.tasks
  SET applicant_count = applicant_count + 1, updated_at = NOW()
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_applicants ON public.task_applications;
CREATE TRIGGER trg_increment_applicants
  AFTER INSERT ON public.task_applications
  FOR EACH ROW EXECUTE FUNCTION public.increment_applicant_count();

-- Increment tasks_posted when a task is created
CREATE OR REPLACE FUNCTION public.increment_tasks_posted()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET tasks_posted = tasks_posted + 1, updated_at = NOW()
  WHERE id = NEW.creator_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_tasks_posted ON public.tasks;
CREATE TRIGGER trg_increment_tasks_posted
  AFTER INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.increment_tasks_posted();

-- Trust level auto-upgrade
CREATE OR REPLACE FUNCTION public.maybe_upgrade_trust(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  p public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = p_user_id;
  IF p.tasks_completed >= 10 AND p.rating_avg >= 4.5 AND p.trust_level = 'established' THEN
    UPDATE public.profiles SET trust_level = 'trusted', updated_at = NOW() WHERE id = p_user_id;
  ELSIF p.tasks_completed >= 3 AND p.rating_avg >= 4.0 AND p.trust_level = 'new' THEN
    UPDATE public.profiles SET trust_level = 'established', updated_at = NOW() WHERE id = p_user_id;
  END IF;
END;
$$;

-- Atomic credits balance increment — never embed supabase.rpc(...) as a
-- literal field value inside a client-side .update({...}), it silently
-- does nothing. Always call this as its own rpc() invocation instead.
CREATE OR REPLACE FUNCTION public.increment_credits(user_id UUID, amount INT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.profiles SET credits_balance = credits_balance + amount WHERE id = user_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_credits(UUID, INT) TO authenticated;

-- Recursion-safe accepted-helper check, used by tasks_select below.
-- SECURITY DEFINER bypasses RLS internally, breaking the circular
-- reference that would otherwise occur (tasks_select -> task_applications
-- RLS -> applications_select's subquery back into tasks -> tasks_select...).
CREATE OR REPLACE FUNCTION public.is_accepted_helper_for_task(_task_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.task_applications
    WHERE task_applications.task_id = _task_id
    AND task_applications.applicant_id = _user_id
    AND task_applications.status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_accepted_helper_for_task(UUID, UUID) TO authenticated, anon;

-- ─── ROW LEVEL SECURITY ──────────────────────

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Profiles: everyone can read; owner can insert/update
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: open tasks are public; creator manages their own; an accepted
-- helper keeps visibility into a task even after it leaves "open" status.
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (
  status = 'open'
  OR creator_id = auth.uid()
  OR public.is_accepted_helper_for_task(id, auth.uid())
);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (creator_id = auth.uid());

-- Applications: applicant + task creator can read; applicant inserts;
-- task creator can update (accept/reject)
CREATE POLICY "applications_select" ON public.task_applications
  FOR SELECT USING (
    applicant_id = auth.uid() OR
    task_id IN (SELECT id FROM public.tasks WHERE creator_id = auth.uid())
  );
CREATE POLICY "applications_insert" ON public.task_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "applications_update" ON public.task_applications
  FOR UPDATE USING (
    task_id IN (SELECT id FROM public.tasks WHERE creator_id = auth.uid())
  );

-- Reviews: public read; reviewer writes
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Credits: own only
CREATE POLICY "credits_select" ON public.credits_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "credits_insert" ON public.credits_transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Conversations: participants only
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));

-- Messages: participants only
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ─── REALTIME ────────────────────────────────

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_applications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── BACKFILL existing auth users ────────────
-- Creates a profile for any user who signed up before this schema was applied.
INSERT INTO public.profiles (id, name, credits_balance)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  20
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

