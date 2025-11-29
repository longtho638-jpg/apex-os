-- CRM & Email "Beehive" Architecture
-- Migration: 20241129210500_crm_beehive.sql

-- 1. CRM Pipelines (The User State)
create table if not exists public.crm_pipelines (
    user_id uuid primary key references auth.users(id) on delete cascade,
    stage text not null default 'LEAD_NEW',
    score int default 0,
    last_interaction timestamptz default now(),
    tags text[] default '{}',
    metadata jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. CRM Events (The Honeycomb Cells)
create table if not exists public.crm_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    event_type text not null, -- 'PAGE_VIEW', 'CLICK', 'EMAIL_OPEN', 'TRADE', 'DEPOSIT'
    metadata jsonb default '{}',
    severity text default 'INFO', -- 'INFO', 'WARN', 'SUCCESS', 'CRITICAL'
    url text,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);

-- 3. Email Logs (Communication History)
create table if not exists public.email_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    email_to text not null,
    template_id text not null,
    subject text,
    status text not null, -- 'SENT', 'OPENED', 'CLICKED', 'BOUNCED'
    metadata jsonb default '{}',
    sent_at timestamptz default now()
);

-- 4. RLS Policies
alter table public.crm_pipelines enable row level security;
alter table public.crm_events enable row level security;
alter table public.email_logs enable row level security;

-- Admin can view all
create policy "Admins can view all pipelines" on public.crm_pipelines
    for select using ( auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin') );

create policy "Admins can view all events" on public.crm_events
    for select using ( auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin') );

create policy "Admins can view all email logs" on public.email_logs
    for select using ( auth.uid() in (select id from auth.users where raw_user_meta_data->>'role' = 'admin') );

-- Users can view their own data (optional, maybe for debugging or transparency)
create policy "Users can view own pipeline" on public.crm_pipelines
    for select using ( auth.uid() = user_id );

-- 5. Indexes for Performance
create index if not exists idx_crm_events_user_id on public.crm_events(user_id);
create index if not exists idx_crm_events_type on public.crm_events(event_type);
create index if not exists idx_email_logs_user_id on public.email_logs(user_id);
