-- Add Compliance Fields to Users Table

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Update Trigger to capture terms acceptance from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, subscription_tier, created_at, updated_at, terms_accepted_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'free',
    NOW(),
    NOW(),
    -- If terms_accepted is true in metadata, set timestamp. Otherwise null (or NOW() if we enforce it)
    CASE 
      WHEN (new.raw_user_meta_data->>'terms_accepted')::boolean IS TRUE THEN NOW()
      ELSE NULL 
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
