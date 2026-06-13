export function SummaryCard({ icon: Icon, label, value }) {
  const urgent = label === 'High Priority';

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className={`mt-2 text-3xl font-semibold ${urgent ? 'text-red-600' : 'text-zinc-950'}`}>{value}</p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-lg border ${
            urgent ? 'border-red-100 bg-red-50 text-red-600' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
