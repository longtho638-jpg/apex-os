-- Trigger to automatically create a public user profile when a new user signs up via Supabase Auth

-- 1. Create the function that the trigger will execute
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, subscription_tier, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'free', -- Default tier
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Handle potential race conditions safely

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Drop if exists to ensure idempotent execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. (Optional) Backfill script for any missing users (Safe to run multiple times)
INSERT INTO public.users (id, email, full_name, subscription_tier, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    'free',
    created_at,
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
