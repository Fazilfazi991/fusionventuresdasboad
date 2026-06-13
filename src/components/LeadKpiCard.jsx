export function LeadKpiCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-50 text-zinc-950">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950">{value}</p>
        </div>
      </div>
    </article>
  );
}
