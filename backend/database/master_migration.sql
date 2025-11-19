-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('trader', 'kol', 'fund_manager', 'admin')) default 'trader',
  persona_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- 2. Exchange Connections (CRITICAL FIX INCLUDED)
create table if not exists public.exchange_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  exchange text not null check (exchange in ('binance', 'bybit', 'okx')),
  api_key text not null,
  api_secret text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exchange_connections enable row level security;

create policy "Users can view own connections" on public.exchange_connections
  for all using (auth.uid() = user_id);

create index if not exists idx_exchange_user on public.exchange_connections(user_id, exchange);

-- 3. Portfolio Snapshots
create table if not exists public.portfolio_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  total_balance numeric not null,
  total_pnl numeric,
  pnl_percent numeric,
  snapshot_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_snapshots enable row level security;

create policy "Users can view own snapshots" on public.portfolio_snapshots
  for select using (auth.uid() = user_id);

-- 4. Guardian Alerts
create table if not exists public.guardian_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  level text check (level in ('info', 'warning', 'critical', 'success')) not null,
  message text not null,
  metadata jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.guardian_alerts enable row level security;

create policy "Users can view own alerts" on public.guardian_alerts
  for select using (auth.uid() = user_id);

-- 5. Agent Logs
create table if not exists public.agent_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  agent_name text not null,
  action text not null,
  status text check (status in ('running', 'completed', 'failed')),
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.agent_logs enable row level security;

create policy "Users can view own logs" on public.agent_logs
  for select using (auth.uid() = user_id);

-- 6. Trade History (Sync System)
create table if not exists public.trade_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    exchange text not null check (exchange in ('binance', 'bybit', 'okx')),
    symbol text not null,
    trade_id text not null,
    side text not null check (side in ('buy', 'sell')),
    price decimal(20, 8) not null check (price > 0),
    quantity decimal(20, 8) not null check (quantity > 0),
    quote_quantity decimal(20, 8),
    fee decimal(20, 8) default 0,
    fee_currency text,
    timestamp timestamptz not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, exchange, trade_id)
);

alter table public.trade_history enable row level security;

create policy "Users can view own trades" on public.trade_history
  for all using (auth.uid() = user_id);

create index if not exists idx_trade_user_time on public.trade_history(user_id, timestamp desc);
create index if not exists idx_trade_symbol on public.trade_history(user_id, symbol, timestamp desc);

-- 7. Sync Jobs (Sync System)
create table if not exists public.sync_jobs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    exchange text not null check (exchange in ('binance', 'bybit', 'okx')),
    status text not null check (status in ('pending', 'running', 'success', 'failed')),
    trades_synced integer default 0,
    last_trade_timestamp timestamptz,
    started_at timestamptz,
    completed_at timestamptz,
    error_message text,
    retry_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.sync_jobs enable row level security;

create policy "Users can view own sync jobs" on public.sync_jobs
  for all using (auth.uid() = user_id);

create index if not exists idx_sync_user_status on public.sync_jobs(user_id, status, created_at desc);
