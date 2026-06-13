const classes = {
  'Not Started': 'bg-zinc-100 text-zinc-700',
  Discussion: 'border border-zinc-300 bg-white text-zinc-700',
  'Need Editor': 'bg-zinc-100 text-zinc-700',
  'Proposal Sent': 'bg-zinc-200 text-zinc-800',
  Development: 'bg-zinc-200 text-zinc-800',
  'Work Started': 'bg-zinc-950 text-white',
  Pending: 'bg-zinc-100 text-zinc-700',
};

export function WorkStatusBadge({ value }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${classes[value] || 'bg-zinc-100 text-zinc-700'}`}>{value}</span>;
}
