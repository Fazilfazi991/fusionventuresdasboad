import { Zap } from 'lucide-react';

export function RecentUpdatesCard({ updates }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-950">Recent Updates</h2>
      </div>

      <div className="mt-6 space-y-5">
        {updates.map((update) => (
          <div key={update.text} className="grid grid-cols-[16px_1fr_auto] items-center gap-3 text-sm">
            <span className="h-2 w-2 rounded-full bg-zinc-950" />
            <span className="min-w-0 text-slate-800">{update.text}</span>
            <span className="whitespace-nowrap text-slate-500">{update.time}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
