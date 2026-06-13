export function UpdatesTimeline({ updates }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="space-y-5">
        {updates.map((update) => (
          <div key={`${update.text}-${update.time}`} className="relative border-l border-zinc-200 pl-5">
            <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-zinc-950" />
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-zinc-950">{update.text}</p>
              <p className="text-xs font-medium text-zinc-500">{update.time}</p>
            </div>
            {update.note ? <p className="mt-1 text-sm text-zinc-500">{update.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
