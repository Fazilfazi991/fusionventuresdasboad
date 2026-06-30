do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumlabel = 'Need Review'
      and enumtypid = 'lead_status'::regtype
  ) then
    alter type lead_status add value 'Need Review' after 'Generated';
  end if;
end $$;

alter table agency_settings
add column if not exists generation_mode text not null default 'template' check (generation_mode in ('template', 'openai'));

update agency_settings
set generation_mode = coalesce(nullif(generation_mode, ''), 'template');
