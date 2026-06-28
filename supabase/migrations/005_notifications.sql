-- =============================================
-- Migration 005: Notification System
-- =============================================

-- ─── NOTIFICATIONS TABLE ─────────────────────

CREATE TYPE notification_type AS ENUM (
  'new_application',
  'application_accepted',
  'application_rejected',
  'new_message',
  'task_completed',
  'new_review',
  'referral_bonus'
);

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  data            JSONB,              -- Additional context (task_id, sender_id, etc.)
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications (user_id, read);

-- ─── RLS ─────────────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ─── FUNCTIONS TO CREATE NOTIFICATIONS ───────

-- Notification for task creator when someone applies
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT
    creator_id,
    'new_application'::notification_type,
    'New applicant!',
    'Someone offered to help with your task.',
    jsonb_build_object(
      'task_id', NEW.task_id,
      'applicant_id', NEW.applicant_id
    )
  FROM tasks
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_application
AFTER INSERT ON task_applications
FOR EACH ROW EXECUTE FUNCTION notify_new_application();

-- Notification for applicant when their application is accepted
CREATE OR REPLACE FUNCTION notify_application_accepted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.applicant_id,
      'application_accepted'::notification_type,
      'Application accepted!',
      'Your offer to help was accepted. Start messaging to coordinate.',
      jsonb_build_object('task_id', NEW.task_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_application_accepted
AFTER UPDATE ON task_applications
FOR EACH ROW EXECUTE FUNCTION notify_application_accepted();

-- Notification for applicant when their application is rejected
CREATE OR REPLACE FUNCTION notify_application_rejected()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.applicant_id,
      'application_rejected'::notification_type,
      'Application declined',
      'The task poster chose someone else for this task.',
      jsonb_build_object('task_id', NEW.task_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_application_rejected
AFTER UPDATE ON task_applications
FOR EACH ROW EXECUTE FUNCTION notify_application_rejected();

-- Notification for new message in conversation
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  participant UUID;
BEGIN
  -- Notify all participants except the sender
  FOR participant IN SELECT unnest(participant_ids) FROM conversations WHERE id = NEW.conversation_id LOOP
    IF participant != NEW.sender_id THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        participant,
        'new_message'::notification_type,
        'New message',
        'You have a new message.',
        jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id)
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Notification when task is completed (for both creator and helper)
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  helper_id UUID;
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Find the accepted helper
    SELECT applicant_id INTO helper_id
    FROM task_applications
    WHERE task_id = NEW.id AND status = 'accepted'
    LIMIT 1;

    -- Notify creator
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.creator_id,
      'task_completed'::notification_type,
      'Task completed!',
      'Great job! Don\'t forget to leave a review.',
      jsonb_build_object('task_id', NEW.id)
    );

    -- Notify helper if exists
    IF helper_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        helper_id,
        'task_completed'::notification_type,
        'Task completed!',
        'Great job! Don\'t forget to leave a review.',
        jsonb_build_object('task_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_task_completed
AFTER UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION notify_task_completed();

-- Notification for new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.reviewee_id,
    'new_review'::notification_type,
    'New review!',
    'Someone left you a review.',
    jsonb_build_object('task_id', NEW.task_id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_review
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION notify_new_review();

-- ─── REALTIME ────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
