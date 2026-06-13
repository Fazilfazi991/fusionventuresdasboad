export function LeadStatusFilters({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
            active === filter
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
