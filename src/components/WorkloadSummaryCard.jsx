export function WorkloadSummaryCard({ workload }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Workload Summary</h2>
      <div className="mt-4 space-y-3">
        {workload.map((item) => (
          <div key={item.venture} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
            <span className="text-sm font-medium text-zinc-700">{item.venture}</span>
            <span className="text-sm font-semibold text-zinc-950">{item.tasks} tasks</span>
          </div>
        ))}
      </div>
    </article>
  );
}
