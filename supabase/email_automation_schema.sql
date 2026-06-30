create extension if not exists pgcrypto;

create type lead_status as enum (
  'New',
  'Generated',
  'Need Review',
  'Draft Created',
  'Sent',
  'Follow-up Needed',
  'Replied',
  'Not Interested',
  'Converted',
  'Skipped'
);

create type pitch_service as enum (
  'Website development',
  'Website redesign',
  'E-commerce website',
  'Travel website/package pages',
  'Branding',
  'Social media design',
  'AI automation',
  'SEO',
  'Custom software'
);

create table agency_settings (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null default 'Fazil',
  agency_name text not null default 'Fusion Ventures',
  portfolio_url text not null default 'https://www.fusionventuresglobal.com/web-portfolio',
  reply_to_email text not null default '',
  sender_email text not null default '',
  default_signature text not null default '',
  daily_draft_limit integer not null default 25 check (daily_draft_limit > 0),
  daily_send_limit integer not null default 25 check (daily_send_limit > 0),
  generation_mode text not null default 'template' check (generation_mode in ('template', 'gemini', 'openai')),
  openai_api_key_encrypted text,
  gmail_connected boolean not null default false,
  bulk_unsubscribe_line text not null default 'If this is not relevant, reply unsubscribe and I will not contact you again.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid,
  business_name text not null,
  contact_name text,
  email text not null,
  website text,
  instagram text,
  industry text,
  location text,
  service_to_pitch pitch_service not null,
  notes text,
  audit_problem text,
  audit_opportunity text,
  audit_pitch_angle text,
  audit_opening_line text,
  audit_generated_at timestamptz,
  status lead_status not null default 'New',
  sequence_status text not null default 'new',
  current_step text,
  next_action_at timestamptz,
  last_sent_at timestamptz,
  replied_at timestamptz,
  reply_status text,
  unsubscribed_at timestamptz,
  closed_at timestamptz,
  follow_up_due_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);

create table generated_emails (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  campaign_id uuid,
  lead_observation text not null,
  subject text not null,
  body text not null,
  follow_up_1 text not null,
  follow_up_2 text not null,
  follow_up_3 text,
  edited_subject text,
  edited_body text,
  approved_subject text,
  approved_body text,
  approved_at timestamptz,
  status text not null default 'Draft',
  model text,
  prompt_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_to_pitch text not null,
  target_industry text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  daily_send_limit integer not null default 25 check (daily_send_limit > 0),
  working_hours_start text not null default '09:00',
  working_hours_end text not null default '17:00',
  send_weekends boolean not null default false,
  followup1_delay_days integer not null default 3,
  followup2_delay_days integer not null default 7,
  followup3_delay_days integer not null default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists email_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  generated_email_id uuid not null references generated_emails(id) on delete cascade,
  step text not null check (step in ('initial', 'followup1', 'followup2', 'followup3')),
  to_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed', 'skipped', 'cancelled')),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  provider text,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, step)
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table gmail_drafts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  generated_email_id uuid references generated_emails(id) on delete set null,
  gmail_draft_id text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table sent_emails (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  generated_email_id uuid not null references generated_emails(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  step text not null default 'initial',
  provider text not null default 'resend',
  provider_message_id text,
  to_email text not null,
  from_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'sent',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (generated_email_id, step)
);

create table outreach_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  event_type text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index leads_status_idx on leads(status);
create index leads_follow_up_due_at_idx on leads(follow_up_due_at);
create index generated_emails_lead_id_idx on generated_emails(lead_id);
create index gmail_drafts_created_at_idx on gmail_drafts(created_at);
create index sent_emails_created_at_idx on sent_emails(created_at);
create index sent_emails_sent_at_idx on sent_emails(sent_at);
create index sent_emails_lead_id_idx on sent_emails(lead_id);
create index if not exists leads_campaign_id_idx on leads(campaign_id);
create index if not exists leads_sequence_status_idx on leads(sequence_status);
create index if not exists leads_next_action_at_idx on leads(next_action_at);
create index if not exists email_queue_status_idx on email_queue(status);
create index if not exists email_queue_scheduled_at_idx on email_queue(scheduled_at);
create index if not exists email_queue_lead_id_idx on email_queue(lead_id);
create index if not exists email_queue_campaign_id_idx on email_queue(campaign_id);
create index if not exists activity_logs_created_at_idx on activity_logs(created_at);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agency_settings_updated_at
before update on agency_settings
for each row execute function set_updated_at();

create trigger leads_updated_at
before update on leads
for each row execute function set_updated_at();

create trigger generated_emails_updated_at
before update on generated_emails
for each row execute function set_updated_at();

create trigger campaigns_updated_at
before update on campaigns
for each row execute function set_updated_at();

create trigger email_queue_updated_at
before update on email_queue
for each row execute function set_updated_at();

alter table if exists agency_settings add column if not exists require_manual_approval_before_first_send boolean not null default true;
alter table if exists agency_settings add column if not exists default_working_hours_start text not null default '09:00';
alter table if exists agency_settings add column if not exists default_working_hours_end text not null default '17:00';
alter table if exists agency_settings add column if not exists send_weekends boolean not null default false;
alter table if exists agency_settings add column if not exists followup1_delay_days integer not null default 3;
alter table if exists agency_settings add column if not exists followup2_delay_days integer not null default 7;
alter table if exists agency_settings add column if not exists followup3_delay_days integer not null default 12;

alter table if exists leads add column if not exists campaign_id uuid references campaigns(id) on delete set null;
alter table if exists leads add column if not exists sequence_status text not null default 'new';
alter table if exists leads add column if not exists current_step text;
alter table if exists leads add column if not exists next_action_at timestamptz;
alter table if exists leads add column if not exists last_sent_at timestamptz;
alter table if exists leads add column if not exists replied_at timestamptz;
alter table if exists leads add column if not exists reply_status text;
alter table if exists leads add column if not exists unsubscribed_at timestamptz;
alter table if exists leads add column if not exists closed_at timestamptz;

alter table if exists generated_emails add column if not exists follow_up_3 text;
alter table if exists generated_emails add column if not exists campaign_id uuid;

update generated_emails
set campaign_id = leads.campaign_id
from leads
where generated_emails.lead_id = leads.id
  and generated_emails.campaign_id is null;

create unique index if not exists generated_emails_one_active_per_lead_campaign_idx
on generated_emails(lead_id, campaign_id)
where status not in ('archived', 'Sent');
create unique index if not exists email_queue_one_initial_per_lead_campaign_idx
on email_queue(lead_id, campaign_id, step)
where step = 'initial' and status in ('queued', 'sending', 'sent');
