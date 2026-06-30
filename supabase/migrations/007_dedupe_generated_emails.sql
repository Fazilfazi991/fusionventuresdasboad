alter table if exists generated_emails add column if not exists campaign_id uuid references campaigns(id) on delete set null;

update generated_emails
set campaign_id = leads.campaign_id
from leads
where generated_emails.lead_id = leads.id
  and generated_emails.campaign_id is null;

with ranked as (
  select
    ge.id,
    row_number() over (
      partition by ge.lead_id, ge.campaign_id
      order by ge.created_at desc, ge.id desc
    ) as rn
  from generated_emails ge
  where ge.status not in ('archived', 'Sent')
    and not exists (
      select 1
      from sent_emails se
      where se.generated_email_id = ge.id
    )
)
update generated_emails ge
set status = 'archived',
    updated_at = now()
from ranked
where ge.id = ranked.id
  and ranked.rn > 1;

create unique index if not exists generated_emails_one_active_per_lead_campaign_idx
on generated_emails(lead_id, campaign_id)
where status not in ('archived', 'Sent');

create unique index if not exists email_queue_one_initial_per_lead_campaign_idx
on email_queue(lead_id, campaign_id, step)
where step = 'initial' and status in ('queued', 'sending', 'sent');
