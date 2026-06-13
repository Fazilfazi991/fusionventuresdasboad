export function OverviewCard({ title, action, children }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        {action ? <button className="text-xs font-semibold text-zinc-500 hover:text-zinc-950">{action}</button> : null}
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}
