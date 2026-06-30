alter table agency_settings
add column if not exists portfolio_url text not null default 'https://www.fusionventuresglobal.com/web-portfolio',
add column if not exists reply_to_email text not null default '',
add column if not exists daily_send_limit integer not null default 25 check (daily_send_limit > 0);

alter table agency_settings
alter column sender_name set default 'Fazil',
alter column agency_name set default 'Fusion Ventures',
alter column portfolio_url set default 'https://www.fusionventuresglobal.com/web-portfolio';

update agency_settings
set
  sender_name = coalesce(nullif(sender_name, ''), 'Fazil'),
  agency_name = coalesce(nullif(agency_name, ''), 'Fusion Ventures'),
  portfolio_url = coalesce(nullif(portfolio_url, ''), 'https://www.fusionventuresglobal.com/web-portfolio'),
  daily_send_limit = coalesce(daily_send_limit, 25);
