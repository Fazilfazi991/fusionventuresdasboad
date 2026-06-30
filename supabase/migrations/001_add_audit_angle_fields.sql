alter table leads
add column if not exists audit_problem text,
add column if not exists audit_opportunity text,
add column if not exists audit_pitch_angle text,
add column if not exists audit_opening_line text,
add column if not exists audit_generated_at timestamptz;
