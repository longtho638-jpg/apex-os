-- ============================================================
-- ApexOS - RLS Policies (Row Level Security)
-- Applies to: users, exchange_connections, portfolio_snapshots,
--             guardian_alerts, agent_logs, trade_history, sync_jobs
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exchange_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.guardian_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. USERS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- ============================================================
-- 2. EXCHANGE_CONNECTIONS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own connections" ON public.exchange_connections;
CREATE POLICY "Users can view own connections" ON public.exchange_connections
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own connections" ON public.exchange_connections;
CREATE POLICY "Users can insert own connections" ON public.exchange_connections
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own connections" ON public.exchange_connections;
CREATE POLICY "Users can update own connections" ON public.exchange_connections
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own connections" ON public.exchange_connections;
CREATE POLICY "Users can delete own connections" ON public.exchange_connections
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 3. PORTFOLIO_SNAPSHOTS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.portfolio_snapshots
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can insert own snapshots" ON public.portfolio_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can update own snapshots" ON public.portfolio_snapshots
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can delete own snapshots" ON public.portfolio_snapshots
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 4. GUARDIAN_ALERTS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can view own alerts" ON public.guardian_alerts
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can insert own alerts" ON public.guardian_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can update own alerts" ON public.guardian_alerts
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can delete own alerts" ON public.guardian_alerts
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 5. AGENT_LOGS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own logs" ON public.agent_logs;
CREATE POLICY "Users can view own logs" ON public.agent_logs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON public.agent_logs;
CREATE POLICY "Users can insert own logs" ON public.agent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own logs" ON public.agent_logs;
CREATE POLICY "Users can update own logs" ON public.agent_logs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own logs" ON public.agent_logs;
CREATE POLICY "Users can delete own logs" ON public.agent_logs
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 6. TRADE_HISTORY TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own trades" ON public.trade_history;
CREATE POLICY "Users can view own trades" ON public.trade_history
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trade_history;
CREATE POLICY "Users can insert own trades" ON public.trade_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON public.trade_history;
CREATE POLICY "Users can update own trades" ON public.trade_history
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trade_history;
CREATE POLICY "Users can delete own trades" ON public.trade_history
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 7. SYNC_JOBS TABLE POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can view own sync jobs" ON public.sync_jobs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can insert own sync jobs" ON public.sync_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can update own sync jobs" ON public.sync_jobs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can delete own sync jobs" ON public.sync_jobs
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check RLS is enabled on all tables
DO $$
BEGIN
  RAISE NOTICE '🔒 RLS Status:';
  RAISE NOTICE '   users: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'users');
  RAISE NOTICE '   exchange_connections: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'exchange_connections');
  RAISE NOTICE '   portfolio_snapshots: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'portfolio_snapshots');
  RAISE NOTICE '   guardian_alerts: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'guardian_alerts');
  RAISE NOTICE '   agent_logs: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'agent_logs');
  RAISE NOTICE '   trade_history: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'trade_history');
  RAISE NOTICE '   sync_jobs: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'sync_jobs');
END $$;

-- List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
