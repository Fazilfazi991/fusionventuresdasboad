export function SetupWarning({ ready }: { ready: boolean }) {
  if (ready) return null;

  return (
    <div className="mb-5 rounded-md border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-ink">
      <p className="font-semibold">Supabase schema is not ready yet.</p>
      <p className="mt-1 text-muted">Open Supabase SQL Editor and run <span className="font-mono text-ink">supabase/schema.sql</span>. If you already ran the first version, also run <span className="font-mono text-ink">supabase/migrations/001_add_audit_angle_fields.sql</span>.</p>
    </div>
  );
}
