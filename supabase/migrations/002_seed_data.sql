-- =============================================
-- Clutch — Seed data for development / demo
-- =============================================

-- Welcome bonus transaction trigger on first login
-- (handled via Supabase Edge Function in production)

-- Insert demo welcome transaction for new users via function:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Create profile with welcome credits
  INSERT INTO profiles (id, name, avatar_url, credits_balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    20
  );

  -- Log welcome bonus transaction
  INSERT INTO credits_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 20, 'bonus', 'Welcome to Clutch! Here are 20 credits to get started.');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
