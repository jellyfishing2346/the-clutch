-- =============================================
-- Migration 007: Reporting and Moderation System
-- =============================================

-- ─── REPORT TYPES ───────────────────────────

CREATE TYPE report_target_type AS ENUM ('task', 'profile', 'message', 'review')
CREATE TYPE report_reason AS ENUM (
  'spam',
  'harassment',
  'inappropriate_content',
  'scam',
  'other'
)
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed')

-- ─── REPORTS TABLE ──────────────────────────

CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type     report_target_type NOT NULL,
  target_id       UUID NOT NULL,
  reason          report_reason NOT NULL,
  description     TEXT,
  status          report_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_target_idx ON reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS reports_reporter_idx ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status, created_at DESC);

-- ─── RLS ─────────────────────────────────────

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON reports
  FOR SELECT USING (
    reporter_id = auth.uid() OR
    reviewed_by = auth.uid()
  );

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_update" ON reports
  FOR UPDATE USING (reviewed_by = auth.uid());

-- ─── FUNCTION TO CREATE REPORT ───────────────

CREATE OR REPLACE FUNCTION create_report(
  p_reporter_id UUID,
  p_target_type report_target_type,
  p_target_id UUID,
  p_reason report_reason,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
BEGIN
  -- Check if user already reported this target
  IF EXISTS (
    SELECT 1 FROM reports
    WHERE reporter_id = p_reporter_id
    AND target_type = p_target_type
    AND target_id = p_target_id
    AND status NOT IN ('resolved', 'dismissed')
  ) THEN
    RAISE EXCEPTION 'You have already reported this item';
  END IF;

  INSERT INTO reports (reporter_id, target_type, target_id, reason, description)
  VALUES (p_reporter_id, p_target_type, p_target_id, p_reason, p_description)
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_report(UUID, report_target_type, UUID, report_reason, TEXT) TO authenticated;

-- ─── FUNCTION TO REVIEW REPORT ───────────────

CREATE OR REPLACE FUNCTION review_report(
  p_report_id UUID,
  p_status report_status,
  p_resolution_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reports
  SET
    status = p_status,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    resolution_note = p_resolution_note
  WHERE id = p_report_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION review_report(UUID, report_status, TEXT) TO authenticated;
