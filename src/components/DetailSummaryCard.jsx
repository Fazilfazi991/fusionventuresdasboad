export function DetailSummaryCard({ icon: Icon, label, value, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'border-zinc-200 bg-white text-zinc-950',
    red: 'border-red-100 bg-red-50 text-red-700',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  };

  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-sm text-zinc-500">{label}</div>
        </div>
      </div>
    </article>
  );
}
