const badgeClasses = {
  High: 'bg-red-600 text-white',
  Medium: 'border border-zinc-500 bg-white text-zinc-800',
  Low: 'bg-emerald-50 text-emerald-700',
  'To Do': 'bg-zinc-100 text-zinc-700',
  Pending: 'bg-zinc-100 text-zinc-700',
  'In Progress': 'bg-zinc-950 text-white',
  Waiting: 'bg-red-50 text-red-700',
  Open: 'bg-zinc-100 text-zinc-700',
  Clear: 'bg-emerald-50 text-emerald-700',
};

export function StatusBadge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[value] || 'bg-zinc-100 text-zinc-700'}`}>{value}</span>;
}

export function DetailTable({ columns, rows, emptyText = 'No items currently.' }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm font-medium text-zinc-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.task || row.item || row.blocker}-${index}`} className="border-t border-zinc-100">
                {columns.map((column) => {
                  const value = row[column.key];
                  const badge = ['status', 'priority'].includes(column.key);
                  return (
                    <td key={column.key} className="px-5 py-4 text-zinc-700">
                      {badge ? <StatusBadge value={value} /> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
