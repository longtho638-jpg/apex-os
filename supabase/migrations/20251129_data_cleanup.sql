-- Data Cleanup Function
-- Handles removal of stale data and enforcement of retention policies

CREATE OR REPLACE FUNCTION cleanup_stale_data()
RETURNS void AS $$
BEGIN
  -- 1. Cleanup expired referral codes (if any were set to expire)
  DELETE FROM referral_codes
  WHERE expires_at < NOW();

  -- 2. Cleanup old audit logs (Retention: 90 days)
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

  -- 3. Cleanup pending vault items that are expired and not claimed
  UPDATE pending_vault
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();

  -- 4. Cleanup old notifications (Retention: 30 days)
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- 5. Cleanup expired sessions/tokens (if stored in DB)
  -- DELETE FROM user_sessions WHERE expires_at < NOW();

END;
$$ LANGUAGE plpgsql;

-- Comment on how to schedule this:
-- Use pg_cron extension if available:
-- SELECT cron.schedule('0 0 * * *', $$SELECT cleanup_stale_data()$$);
