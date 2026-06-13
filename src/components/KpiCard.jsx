export function KpiCard({ icon: Icon, label, value }) {
  const usefulTone = label === 'Active Ventures' ? 'green' : label === 'In Testing' ? 'red' : 'neutral';
  const toneClasses = {
    neutral: 'border-zinc-200 bg-zinc-50 text-zinc-800',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    red: 'border-red-100 bg-red-50 text-red-600',
  };
  const valueClasses = {
    neutral: 'text-zinc-950',
    green: 'text-emerald-700',
    red: 'text-red-600',
  };

  return (
    <article className="flex min-h-[126px] items-center gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border ${toneClasses[usefulTone]}`}>
        <Icon className="h-8 w-8" strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-base font-medium text-slate-900">{label}</p>
        <p className={`mt-1 text-3xl font-extrabold leading-none sm:text-4xl ${valueClasses[usefulTone]}`}>{value}</p>
      </div>
    </article>
  );
}
