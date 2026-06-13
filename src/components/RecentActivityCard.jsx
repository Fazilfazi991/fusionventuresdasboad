export function RecentActivityCard({ activity }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Recent Activity</h2>
      <div className="mt-4 space-y-3">
        {activity.map((item) => (
          <div key={item} className="flex gap-3 text-sm text-zinc-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
