-- =====================================================
-- APEX OS - Money Engine Performance Optimization
-- Version: 010
-- Purpose: Add performance indexes for withdrawal queries
-- =====================================================

-- Add composite index for admin withdrawal queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created
  ON public.withdrawals(status, created_at DESC) 
  WHERE status IN ('pending', 'processing');

-- Add index for user withdrawal history
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created
  ON public.withdrawals(user_id, created_at DESC);

COMMENT ON INDEX idx_withdrawals_status_created IS 'Optimizes admin payout queue queries';
COMMENT ON INDEX idx_withdrawals_user_created IS 'Optimizes user withdrawal history queries';
