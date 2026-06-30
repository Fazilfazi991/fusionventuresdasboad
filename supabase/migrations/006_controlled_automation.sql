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
  updated_at timestamptz not null default now()
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
alter table if exists sent_emails add column if not exists campaign_id uuid references campaigns(id) on delete set null;
alter table if exists sent_emails add column if not exists step text not null default 'initial';

create unique index if not exists email_queue_one_send_per_lead_step_idx on email_queue(lead_id, step);
drop index if exists sent_emails_one_per_generated_email_idx;
alter table if exists sent_emails drop constraint if exists sent_emails_generated_email_id_key;
create unique index if not exists sent_emails_one_per_generated_email_step_idx on sent_emails(generated_email_id, step);
create index if not exists leads_campaign_id_idx on leads(campaign_id);
create index if not exists leads_sequence_status_idx on leads(sequence_status);
create index if not exists leads_next_action_at_idx on leads(next_action_at);
create index if not exists email_queue_status_idx on email_queue(status);
create index if not exists email_queue_scheduled_at_idx on email_queue(scheduled_at);
create index if not exists email_queue_lead_id_idx on email_queue(lead_id);
create index if not exists email_queue_campaign_id_idx on email_queue(campaign_id);
create index if not exists sent_emails_sent_at_idx on sent_emails(sent_at);
create index if not exists activity_logs_created_at_idx on activity_logs(created_at);

drop trigger if exists campaigns_updated_at on campaigns;
create trigger campaigns_updated_at before update on campaigns for each row execute function set_updated_at();

drop trigger if exists email_queue_updated_at on email_queue;
create trigger email_queue_updated_at before update on email_queue for each row execute function set_updated_at();
