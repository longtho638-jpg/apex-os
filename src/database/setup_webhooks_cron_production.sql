-- PRODUCTION SETUP SCRIPT
-- Run this in your Supabase SQL Editor for the PRODUCTION project

-- 1. Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 3. Create function to trigger Edge Function on new account link
CREATE OR REPLACE FUNCTION public.trigger_verify_exchange()
RETURNS TRIGGER AS $$
DECLARE
  -- [CONFIGURATION REQUIRED]
  -- Replace with your actual PRODUCTION project URL
  edge_function_url TEXT := 'https://[YOUR_PROD_PROJECT_REF].supabase.co/functions/v1/verify-exchange-prod';
  
  -- [CONFIGURATION REQUIRED]
  -- Replace with your actual PRODUCTION Supabase Anon Key
  anon_key TEXT := '[YOUR_PROD_ANON_KEY]'; 
  
  payload JSONB;
BEGIN
  -- Validation
  IF edge_function_url LIKE '%[YOUR_PROD_PROJECT_REF]%' OR anon_key = '[YOUR_PROD_ANON_KEY]' THEN
    RAISE EXCEPTION 'Please configure edge_function_url and anon_key in trigger_verify_exchange function before running in production';
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    'record', row_to_json(NEW),
    'type', TG_OP,
    'table', TG_TABLE_NAME
  );

  -- Fire and Forget request
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach Trigger to user_exchange_accounts table
DROP TRIGGER IF EXISTS on_exchange_account_created ON public.user_exchange_accounts;

CREATE TRIGGER on_exchange_account_created
AFTER INSERT ON public.user_exchange_accounts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_verify_exchange();

-- 5. Schedule Daily Re-verification Job (Cron)
-- Runs at 03:00 AM UTC daily
SELECT cron.schedule(
  'daily-exchange-reverify-prod',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
        url := 'https://[YOUR_PROD_PROJECT_REF].supabase.co/functions/v1/reverify-scheduler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer [YOUR_PROD_ANON_KEY]"}'::jsonb,
        body := jsonb_build_object('batch_size', 500)
    )
  $$
);
