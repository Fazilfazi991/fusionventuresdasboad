alter table agency_settings
drop constraint if exists agency_settings_generation_mode_check;

alter table agency_settings
add constraint agency_settings_generation_mode_check
check (generation_mode in ('template', 'gemini', 'openai'));

update agency_settings
set generation_mode = 'gemini'
where generation_mode = 'openai';
