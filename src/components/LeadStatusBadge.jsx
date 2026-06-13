const classes = {
  'New Lead': 'bg-zinc-100 text-zinc-700',
  'Follow-up': 'border border-zinc-300 bg-white text-zinc-700',
  Meeting: 'bg-zinc-100 text-zinc-700',
  'Proposal Shared': 'bg-zinc-200 text-zinc-800',
  Converted: 'bg-zinc-950 text-white',
  'In Progress': 'bg-zinc-700 text-white',
};

export function LeadStatusBadge({ value }) {
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${classes[value] || 'bg-zinc-100 text-zinc-700'}`}>{value}</span>;
}
