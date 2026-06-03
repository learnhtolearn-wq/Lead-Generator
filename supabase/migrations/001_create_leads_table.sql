-- Migration: 001_create_leads_table
-- Run this in: Supabase Dashboard → SQL Editor → New Query

create table if not exists leads (
  id           uuid        primary key default gen_random_uuid(),
  run_id       text        not null,
  company_name text,
  contact_name text,
  email        text,
  website_url  text,
  created_at   timestamptz default now()
);

-- Index for fast lookup by run_id
create index if not exists leads_run_id_idx on leads (run_id);
