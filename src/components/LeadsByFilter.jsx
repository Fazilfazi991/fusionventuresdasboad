export function LeadsByFilter({ counts, active, onChange }) {
  const people = ['All', 'Ayisha', 'Fazil', 'Thameem'];

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-950">Leads By</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {people.map((person) => (
          <button
            key={person}
            type="button"
            onClick={() => onChange(person)}
            className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
              active === person
                ? 'border-zinc-950 bg-zinc-950 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
            }`}
          >
            {person} <span className="ml-1 opacity-70">{counts[person] || 0}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
