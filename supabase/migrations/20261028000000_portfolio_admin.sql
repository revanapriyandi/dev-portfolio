-- Portfolio admin panel: contact inbox, Aksa chat logs, privacy-friendly page views.
-- Run once in the Supabase SQL Editor of the project you use for the portfolio.
-- Only the server (service role key) touches these tables: RLS is on with no policies,
-- and the public API roles get no grants at all.

create table if not exists public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) <= 2000),
  delivered_telegram boolean not null default false,
  delivered_email boolean not null default false,
  read_at timestamptz
);

create table if not exists public.portfolio_chat_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor text not null,            -- salted daily hash, not an IP
  question text not null check (char_length(question) <= 800),
  answer text not null default ''
);

create table if not exists public.portfolio_pageviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor text not null,            -- salted daily hash, not an IP; no cookies involved
  path text not null check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 300),
  country text check (char_length(country) <= 2),
  device text check (device in ('mobile', 'tablet', 'desktop'))
);

create index if not exists portfolio_messages_created_idx on public.portfolio_messages (created_at desc);
create index if not exists portfolio_chat_logs_created_idx on public.portfolio_chat_logs (created_at desc);
create index if not exists portfolio_pageviews_created_idx on public.portfolio_pageviews (created_at desc);

alter table public.portfolio_messages enable row level security;
alter table public.portfolio_chat_logs enable row level security;
alter table public.portfolio_pageviews enable row level security;

revoke all on public.portfolio_messages, public.portfolio_chat_logs, public.portfolio_pageviews from anon, authenticated;
