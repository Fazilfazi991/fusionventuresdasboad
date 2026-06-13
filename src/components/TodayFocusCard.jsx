import { Target } from 'lucide-react';

export function TodayFocusCard({ items }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-white">
          <Target className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-950">Today&apos;s Focus</h2>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <label key={item} className="flex items-start gap-4 text-sm text-slate-800">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-zinc-950 focus:ring-zinc-700"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </article>
  );
}
