export function FilterTabs({ filters, active = 'All' }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
            filter === active
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-950'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
