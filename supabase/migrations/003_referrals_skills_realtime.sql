-- =============================================
-- Migration 003: Referrals, Skills, Realtime
-- =============================================

-- ─── PROFILE EXTENSIONS ──────────────────────

-- Referral code — unique short token per user
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8),
  ADD COLUMN IF NOT EXISTS referred_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS skills        TEXT[] NOT NULL DEFAULT '{}';

-- Ensure every existing row gets a referral code
UPDATE profiles SET referral_code = SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8)
WHERE referral_code IS NULL;

-- ─── REFERRALS TABLE ─────────────────────────

CREATE TABLE IF NOT EXISTS referrals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credited_at  TIMESTAMPTZ,          -- NULL until credits are issued
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referred_id)               -- each user can only be referred once
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "referrals_insert" ON referrals
  FOR INSERT WITH CHECK (referred_id = auth.uid());

-- ─── REALTIME ────────────────────────────────

-- Enable live updates on tasks so the feed refreshes without polling
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
