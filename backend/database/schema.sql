-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
  id uuid references auth.users not null primary key, -- Link to Supabase Auth
  email text unique not null,
  full_name text,
  role text check (role in ('trader', 'kol', 'fund_manager', 'admin')) default 'trader',
  persona_id text, -- To link to our specific personas (persona_1, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- 2. Exchange Connections
create table public.exchange_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  exchange_id text not null check (exchange_id in ('binance', 'bybit', 'okx')),
  api_key_encrypted text not null, -- In real app, store encrypted
  api_secret_encrypted text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.exchange_connections enable row level security;

-- Policy: Users can only see their own connections
create policy "Users can view own connections" on public.exchange_connections
  for select using (auth.uid() = user_id);

-- 3. Portfolio Snapshots (For Charts)
create table public.portfolio_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  total_balance numeric not null,
  total_pnl numeric,
  pnl_percent numeric,
  snapshot_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.portfolio_snapshots enable row level security;

create policy "Users can view own snapshots" on public.portfolio_snapshots
  for select using (auth.uid() = user_id);

-- 4. Guardian Alerts
create table public.guardian_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  level text check (level in ('info', 'warning', 'critical', 'success')) not null,
  message text not null,
  metadata jsonb, -- Store extra details like symbol, price
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.guardian_alerts enable row level security;

create policy "Users can view own alerts" on public.guardian_alerts
  for select using (auth.uid() = user_id);

-- 5. Agent Logs
create table public.agent_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  agent_name text not null, -- 'Collector', 'Auditor', 'Guardian'
  action text not null,
  status text check (status in ('running', 'completed', 'failed')),
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.agent_logs enable row level security;

create policy "Users can view own logs" on public.agent_logs
  for select using (auth.uid() = user_id);
