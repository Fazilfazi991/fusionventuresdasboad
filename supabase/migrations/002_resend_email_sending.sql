alter table generated_emails
add column if not exists approved_subject text,
add column if not exists approved_body text,
add column if not exists approved_at timestamptz,
add column if not exists status text not null default 'Draft';

create table if not exists sent_emails (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  generated_email_id uuid not null references generated_emails(id) on delete cascade,
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
  unique (generated_email_id)
);

create index if not exists sent_emails_created_at_idx on sent_emails(created_at);
create index if not exists sent_emails_sent_at_idx on sent_emails(sent_at);
create index if not exists sent_emails_lead_id_idx on sent_emails(lead_id);
