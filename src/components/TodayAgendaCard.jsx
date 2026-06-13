export function TodayAgendaCard({ agenda }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Today's Agenda</h2>
      <div className="mt-4 space-y-4">
        {agenda.map((item) => (
          <div key={`${item.time}-${item.task}`} className="grid grid-cols-[74px_1fr] gap-3 text-sm">
            <span className="font-semibold text-zinc-950">{item.time}</span>
            <div>
              <p className="font-medium text-zinc-800">{item.task}</p>
              <p className="mt-1 text-xs font-medium text-zinc-500">{item.venture}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
