-- =============================================================
-- Performance Indexes Migration
-- Date: 2026-03-01
-- Purpose: Add missing composite/partial indexes for trading
--          queries, user lookups, and time-range scans.
--          All indexes use IF NOT EXISTS for idempotency.
-- =============================================================

-- -------------------------------------------------------
-- orders: composite for active order book queries
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_user_created
    ON orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_symbol_side_status
    ON orders(symbol, side, status)
    WHERE status IN ('pending', 'open');

-- -------------------------------------------------------
-- trades: time-range + user reporting queries
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trades_user_created
    ON trades(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trades_symbol_created
    ON trades(symbol, created_at DESC);

-- -------------------------------------------------------
-- positions: open position lookups (hot path)
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_positions_user_symbol
    ON positions(user_id, symbol)
    WHERE status = 'OPEN';

CREATE INDEX IF NOT EXISTS idx_positions_symbol_status
    ON positions(symbol, status);

-- -------------------------------------------------------
-- wallet_transactions: paginated ledger queries
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_created
    ON wallet_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status_created
    ON wallet_transactions(status, created_at DESC)
    WHERE status = 'PENDING';

-- -------------------------------------------------------
-- payout_requests: pending payout admin queries
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_status
    ON payout_requests(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payout_requests_status_created
    ON payout_requests(status, created_at DESC)
    WHERE status = 'pending';

-- -------------------------------------------------------
-- crm_events: user activity timeline queries
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_crm_events_user_created
    ON crm_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_events_type_created
    ON crm_events(event_type, created_at DESC);

-- -------------------------------------------------------
-- subscriptions: active subscription tier checks
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
    ON subscriptions(user_id, status)
    WHERE status = 'active';
