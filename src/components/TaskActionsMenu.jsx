import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const statusActions = [
  { label: 'Move to To Do', status: 'To Do' },
  { label: 'Move to In Progress', status: 'In Progress' },
  { label: 'Move to Testing', status: 'Testing' },
  { label: 'Mark as Blocked', status: 'Blocked' },
  { label: 'Mark as Completed', status: 'Completed' },
];

export function TaskActionsMenu({ task, onEdit, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);

  const runAction = (action) => {
    action();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Task actions"
        className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg">
          <button
            type="button"
            onClick={() => runAction(() => onEdit(task))}
            className="block w-full px-3 py-2 text-left font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Edit Task
          </button>
          {statusActions.map((item) => (
            <button
              key={item.status}
              type="button"
              onClick={() => runAction(() => onStatusChange(task.id, item.status))}
              className="block w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => runAction(() => onDelete(task))}
            className="block w-full px-3 py-2 text-left font-medium text-zinc-950 hover:bg-zinc-50"
          >
            Delete Task
          </button>
        </div>
      ) : null}
    </div>
  );
}
