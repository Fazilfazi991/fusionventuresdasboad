-- Fusion OS starter data
-- Run after creating auth users for Ayisha, Fazil, and Thameem.

update public.users set role = 'Admin' where lower(name) in ('fazil', 'ayisha', 'thameem');

insert into public.ventures (name, slug, description, stage, priority, progress, status)
values
  ('Dearelle', 'dearelle', 'E-commerce business for India launch preparation and growth.', 'Launch Prep', 'High Priority', 72, 'Active'),
  ('Plumlet', 'plumlet', 'Marketplace flow testing for seller, buyer, orders, custom orders, payments, and back order tracking.', 'Testing', 'High Priority', 45, 'Active'),
  ('Website Builder', 'website-builder', 'Website builder platform development, branding, account testing, and builder flow testing.', 'Development', 'Medium Priority', 60, 'Active'),
  ('Web Development', 'web-development', 'Web development service with lead tracking, client projects, follow-ups, and pending work.', 'Live Service', 'Medium Priority', 85, 'Active'),
  ('Ed Tech Platform', 'education-system', 'Education platform planning, member connection, curriculum setup, and course structure.', 'Planning', 'Low Priority', 20, 'Active')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  stage = excluded.stage,
  priority = excluded.priority,
  progress = excluded.progress,
  status = excluded.status;

insert into public.web_dev_leads (
  client,
  service,
  estimated_amount,
  received_amount,
  lead_status,
  work_status,
  lead_by,
  next_action,
  follow_up_date,
  notes
)
values
  ('Kaam', 'Website Development', 3000, 600, 'Converted', 'Work Started', (select id from public.users where lower(name) = 'fazil' limit 1), 'Work started by Pranav', '2025-05-18', 'Initial advance received. Work started.'),
  ('Aims', 'Website Development', 600, 0, 'Follow-up', 'Not Started', (select id from public.users where lower(name) = 'ayisha' limit 1), 'Follow up', '2025-05-20', 'Need to reconnect and confirm scope.'),
  ('Perfume', 'E-commerce Website', 3000, 0, 'Meeting', 'Discussion', (select id from public.users where lower(name) = 'thameem' limit 1), 'Visit on Sunday', '2025-05-18', 'Meeting expected in person.'),
  ('Oaktree', 'Website Development', 800, 0, 'In Progress', 'Need Editor', (select id from public.users where lower(name) = 'ayisha' limit 1), 'Looking for video editor', '2025-05-22', 'Video support needed before proceeding.'),
  ('Amazon Noon', 'Landing Page', 1000, 500, 'Converted', 'Work Started', (select id from public.users where lower(name) = 'thameem' limit 1), 'Work started by Ayisha', '2025-05-19', 'Advance collected. Work active.'),
  ('copy', 'Website Copywriting', 400, 0, 'New Lead', 'Not Started', (select id from public.users where lower(name) = 'fazil' limit 1), 'Initial discussion done', '2025-05-21', 'Need next follow-up.'),
  ('specs', 'Website Development', 700, 0, 'Follow-up', 'Not Started', (select id from public.users where lower(name) = 'ayisha' limit 1), 'Send proposal', '2025-05-23', 'Proposal pending.'),
  ('ecom qatar', 'E-commerce Website', 2000, 0, 'Proposal Shared', 'Development', (select id from public.users where lower(name) = 'fazil' limit 1), 'Work started', '2025-05-24', 'Proposal shared, development planning ongoing.'),
  ('Logistics website and marketing', 'Website + Marketing', 900, 450, 'Converted', 'Work Started', (select id from public.users where lower(name) = 'thameem' limit 1), 'Will get advance today, work started', '2025-05-18', 'Partial payment received.'),
  ('Eshadi integrated solutions', 'Website Development', 600, 340, 'Proposal Shared', 'Proposal Sent', (select id from public.users where lower(name) = 'ayisha' limit 1), 'Follow up', '2025-05-20', 'Proposal sent and waiting response.'),
  ('Flytours', 'Website Development', 600, 0, 'New Lead', 'Pending', (select id from public.users where lower(name) = 'fazil' limit 1), 'Pending development by Fazil', '2025-05-25', 'Scope to be reviewed.'),
  ('ponkudam jewellers', 'E-commerce Website', 1100, 0, 'Follow-up', 'Pending', (select id from public.users where lower(name) = 'thameem' limit 1), 'Development by Thameem', '2025-05-26', 'Need follow-up before development.');
