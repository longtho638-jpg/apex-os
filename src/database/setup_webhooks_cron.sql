-- 1. Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 3. Create function to trigger Edge Function on new account link
CREATE OR REPLACE FUNCTION public.trigger_verify_exchange()
RETURNS TRIGGER AS $$
DECLARE
  -- [CONFIGURATION REQUIRED]
  -- Replace with your actual project URL from Supabase Dashboard > Edge Functions
  edge_function_url TEXT := 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/verify-exchange-mock';
  
  -- [CONFIGURATION REQUIRED]
  -- Replace with your actual Supabase Anon Key from Project Settings > API
  anon_key TEXT := '[YOUR_ANON_KEY]'; 
  
  payload JSONB;
BEGIN
  -- Validation: Check if configuration is set
  IF edge_function_url LIKE '%[YOUR_PROJECT_REF]%' OR anon_key = '[YOUR_ANON_KEY]' THEN
    RAISE EXCEPTION 'Please configure edge_function_url and anon_key in trigger_verify_exchange function before running';
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
  'daily-exchange-reverify',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
        url := 'https://ryvpqbuftmlsynmajecx.supabase.co/functions/v1/reverify-scheduler',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object('batch_size', 100)
    )
  $$
);

-- Useful commands for management (commented out):
-- SELECT * FROM cron.job;
-- SELECT cron.unschedule('daily-exchange-reverify');
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
