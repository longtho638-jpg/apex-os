-- Function to calculate 24h volume efficiently
-- Avoids fetching all rows to application layer
CREATE OR REPLACE FUNCTION calculate_total_volume_24h()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_vol NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_vol
  FROM transactions
  WHERE status = 'completed'
  AND created_at > (NOW() - INTERVAL '24 hours');
  
  RETURN total_vol;
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_status_created_at 
ON transactions(status, created_at);

CREATE INDEX IF NOT EXISTS idx_users_last_sign_in 
ON users(last_sign_in_at);
