-- ============================================================
-- ApexOS - Master Database Schema
-- Version: 2.0 (Supabase Agent Optimized)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('trader', 'kol', 'fund_manager', 'admin')) DEFAULT 'trader',
  persona_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = id);

-- ============================================================
-- 2. EXCHANGE CONNECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exchange_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx')),
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.exchange_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own connections" ON public.exchange_connections;
CREATE POLICY "Users can view own connections" ON public.exchange_connections
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own connections" ON public.exchange_connections;
CREATE POLICY "Users can insert own connections" ON public.exchange_connections
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own connections" ON public.exchange_connections;
CREATE POLICY "Users can update own connections" ON public.exchange_connections
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own connections" ON public.exchange_connections;
CREATE POLICY "Users can delete own connections" ON public.exchange_connections
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_exchange_user ON public.exchange_connections(user_id, exchange);

-- ============================================================
-- 3. PORTFOLIO SNAPSHOTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  total_balance NUMERIC NOT NULL,
  total_pnl NUMERIC,
  pnl_percent NUMERIC,
  snapshot_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.portfolio_snapshots
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can insert own snapshots" ON public.portfolio_snapshots
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can update own snapshots" ON public.portfolio_snapshots
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.portfolio_snapshots;
CREATE POLICY "Users can delete own snapshots" ON public.portfolio_snapshots
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 4. GUARDIAN ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.guardian_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  level TEXT CHECK (level IN ('info', 'warning', 'critical', 'success')) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.guardian_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can view own alerts" ON public.guardian_alerts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can insert own alerts" ON public.guardian_alerts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can update own alerts" ON public.guardian_alerts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.guardian_alerts;
CREATE POLICY "Users can delete own alerts" ON public.guardian_alerts
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 5. AGENT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own logs" ON public.agent_logs;
CREATE POLICY "Users can view own logs" ON public.agent_logs
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON public.agent_logs;
CREATE POLICY "Users can insert own logs" ON public.agent_logs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own logs" ON public.agent_logs;
CREATE POLICY "Users can update own logs" ON public.agent_logs
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own logs" ON public.agent_logs;
CREATE POLICY "Users can delete own logs" ON public.agent_logs
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================
-- 6. TRADE HISTORY (Sync System)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.trade_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx')),
  symbol TEXT NOT NULL,
  trade_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price DECIMAL(20, 8) NOT NULL CHECK (price > 0),
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
  quote_quantity DECIMAL(20, 8),
  fee DECIMAL(20, 8) DEFAULT 0,
  fee_currency TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exchange, trade_id)
);

ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trades" ON public.trade_history;
CREATE POLICY "Users can view own trades" ON public.trade_history
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own trades" ON public.trade_history;
CREATE POLICY "Users can insert own trades" ON public.trade_history
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own trades" ON public.trade_history;
CREATE POLICY "Users can update own trades" ON public.trade_history
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own trades" ON public.trade_history;
CREATE POLICY "Users can delete own trades" ON public.trade_history
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_trade_user_time ON public.trade_history(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trade_symbol ON public.trade_history(user_id, symbol, timestamp DESC);

-- ============================================================
-- 7. SYNC JOBS (Sync System)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
  trades_synced INTEGER DEFAULT 0,
  last_trade_timestamp TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can view own sync jobs" ON public.sync_jobs
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can insert own sync jobs" ON public.sync_jobs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can update own sync jobs" ON public.sync_jobs
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own sync jobs" ON public.sync_jobs;
CREATE POLICY "Users can delete own sync jobs" ON public.sync_jobs
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_sync_user_status ON public.sync_jobs(user_id, status, created_at DESC);

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Master schema migration complete!';
  RAISE NOTICE '📊 Tables created: 7';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '📑 Total policies: 28 (4 per table)';
END $$;
