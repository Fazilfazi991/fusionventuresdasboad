const stageClasses = {
  'Launch Prep': 'bg-zinc-950 text-white',
  Testing: 'bg-zinc-500 text-white',
  Development: 'bg-zinc-100 text-zinc-800',
  'Live Service': 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  Planning: 'bg-zinc-50 text-zinc-600',
};

const priorityClasses = {
  High: 'bg-red-600 text-white',
  Medium: 'border border-zinc-600 bg-white text-zinc-800',
  Low: 'bg-emerald-50 text-emerald-700',
};

function Badge({ children, className }) {
  return <span className={`inline-flex rounded-md px-3 py-1 text-sm font-medium ${className}`}>{children}</span>;
}

export function VentureSnapshotTable({ ventures }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-slate-950">Venture Snapshot</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500">
              <th className="py-3 pr-6">Venture</th>
              <th className="py-3 pr-6">Stage</th>
              <th className="py-3 pr-6">Priority</th>
              <th className="py-3 pr-6 text-center">Pending</th>
              <th className="py-3">Next Action</th>
            </tr>
          </thead>
          <tbody>
            {ventures.map((venture) => (
              <tr key={venture.name} className="border-b border-slate-100 last:border-0">
                <td className="py-4 pr-6 font-bold text-slate-950">{venture.name}</td>
                <td className="py-4 pr-6">
                  <Badge className={stageClasses[venture.stage]}>{venture.stage}</Badge>
                </td>
                <td className="py-4 pr-6">
                  <Badge className={priorityClasses[venture.priority]}>{venture.priority}</Badge>
                </td>
                <td className="py-4 pr-6 text-center font-medium text-slate-900">{venture.pending}</td>
                <td className="py-4 text-slate-800">{venture.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
