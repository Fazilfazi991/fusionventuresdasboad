import { MoreHorizontal, Pencil } from 'lucide-react';

export function LeadRowActions({ onEdit }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
      <button
        type="button"
        aria-label="More lead actions"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
