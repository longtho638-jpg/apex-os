-- Performance Indexes for Scalability & DoS Prevention
-- Adds indexes to foreign keys and frequently queried columns

-- 1. Orders Table (High Volume)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 2. Transactions Table (High Volume)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 3. Virtual Trading (High Volume)
CREATE INDEX IF NOT EXISTS idx_virtual_positions_user_id ON virtual_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_positions_status ON virtual_positions(status);
CREATE INDEX IF NOT EXISTS idx_virtual_wallets_user_id ON virtual_wallets(user_id);

-- 4. Notifications (High Volume)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 5. Audit Logs (High Volume)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 6. Referral System
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer_id ON referral_conversions(referrer_id);

-- Comment: These indexes transform O(N) lookups into O(log N), 
-- preventing CPU spikes during high concurrency.
