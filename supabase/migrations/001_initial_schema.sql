-- =============================================
-- Clutch — Initial Database Schema
-- =============================================

-- Enable PostGIS for geographic queries (optional, kept for compatibility)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── ENUMS ───────────────────────────────────

CREATE TYPE trust_level AS ENUM ('new', 'established', 'trusted', 'verified');
CREATE TYPE task_category AS ENUM (
  'simple_help', 'errands', 'delivery', 'moving',
  'cleaning', 'cooking', 'pet_care', 'tech_help',
  'repairs', 'tutoring', 'skilled', 'other'
);
CREATE TYPE payment_type AS ENUM ('cash', 'credits', 'exchange', 'free');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE credits_tx_type AS ENUM ('earned', 'spent', 'bonus');

-- ─── USER PROFILES ───────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
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
  is_id_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TASKS ───────────────────────────────────

CREATE TABLE tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 100),
  description         TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 600),
  category            task_category NOT NULL,
  required_trust_level trust_level NOT NULL DEFAULT 'new',
  location            JSONB NOT NULL,
  address             TEXT NOT NULL,
  neighborhood        TEXT,
  borough             TEXT,
  payment_type        payment_type NOT NULL,
  payment_amount      NUMERIC(10,2),
  credits_amount      INTEGER,
  status              task_status NOT NULL DEFAULT 'open',
  applicant_count     INTEGER NOT NULL DEFAULT 0,
  scheduled_for       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for location queries (JSONB)
CREATE INDEX tasks_location_idx ON tasks USING GIN (location);
CREATE INDEX tasks_status_idx ON tasks (status);
CREATE INDEX tasks_creator_idx ON tasks (creator_id);
CREATE INDEX tasks_category_idx ON tasks (category);

-- ─── TASK APPLICATIONS ───────────────────────

CREATE TABLE task_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message      TEXT,
  status       application_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, applicant_id)
);

CREATE INDEX applications_task_idx ON task_applications (task_id);
CREATE INDEX applications_applicant_idx ON task_applications (applicant_id);

-- ─── REVIEWS ─────────────────────────────────

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, reviewer_id)
);

CREATE INDEX reviews_reviewee_idx ON reviews (reviewee_id);

-- ─── CREDITS TRANSACTIONS ─────────────────────

CREATE TABLE credits_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        credits_tx_type NOT NULL,
  description TEXT NOT NULL,
  task_id     UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX credits_user_idx ON credits_transactions (user_id);

-- ─── CONVERSATIONS & MESSAGES ─────────────────

CREATE TABLE conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID REFERENCES tasks(id) ON DELETE CASCADE,
  participant_ids UUID[] NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at DESC);

-- ─── FUNCTIONS ───────────────────────────────

-- Nearby tasks within radius_km (using JSONB location)
-- Note: This is a simplified version that doesn't do actual geospatial distance calculation
-- For production, consider using PostGIS or a proper geospatial library
CREATE OR REPLACE FUNCTION tasks_nearby(
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  radius_km   DOUBLE PRECISION DEFAULT 2,
  p_category  task_category DEFAULT NULL,
  p_payment   payment_type DEFAULT NULL
)
RETURNS SETOF tasks
LANGUAGE sql STABLE AS $$
  SELECT *
  FROM tasks
  WHERE
    status = 'open'
    AND (p_category IS NULL OR category = p_category)
    AND (p_payment IS NULL OR payment_type = p_payment)
  ORDER BY
    created_at DESC
  LIMIT 50;
$$;

-- Update user rating after each review insert
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE profiles SET
    rating_avg   = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    updated_at   = NOW()
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_rating
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Increment applicant count
CREATE OR REPLACE FUNCTION increment_applicant_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE tasks SET applicant_count = applicant_count + 1, updated_at = NOW()
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_applicants
AFTER INSERT ON task_applications
FOR EACH ROW EXECUTE FUNCTION increment_applicant_count();

-- Update trust level based on completed tasks + rating
CREATE OR REPLACE FUNCTION maybe_upgrade_trust(user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  p profiles%ROWTYPE;
BEGIN
  SELECT * INTO p FROM profiles WHERE id = user_id;
  IF p.tasks_completed >= 10 AND p.rating_avg >= 4.5 AND p.trust_level = 'established' THEN
    UPDATE profiles SET trust_level = 'trusted', updated_at = NOW() WHERE id = user_id;
  ELSIF p.tasks_completed >= 3 AND p.rating_avg >= 4.0 AND p.trust_level = 'new' THEN
    UPDATE profiles SET trust_level = 'established', updated_at = NOW() WHERE id = user_id;
  END IF;
END;
$$;

-- ─── ROW LEVEL SECURITY ──────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: everyone can read, only owner can update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: open tasks are public; creator controls their own
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (status = 'open' OR creator_id = auth.uid());
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (creator_id = auth.uid());

-- Applications: applicant + task creator can see
CREATE POLICY "applications_select" ON task_applications
  FOR SELECT USING (
    applicant_id = auth.uid() OR
    task_id IN (SELECT id FROM tasks WHERE creator_id = auth.uid())
  );
CREATE POLICY "applications_insert" ON task_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- Reviews: public read, reviewer writes once
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Credits: own only
CREATE POLICY "credits_select" ON credits_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "credits_insert" ON credits_transactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Messages: participants only
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE auth.uid() = ANY(participant_ids)
    )
  );
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ─── REALTIME ────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE task_applications;
