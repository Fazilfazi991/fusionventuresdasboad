import { CalendarDays } from 'lucide-react';

const priorityClasses = {
  High: 'bg-zinc-950 text-white',
  Medium: 'border border-zinc-500 bg-white text-zinc-800',
  Low: 'bg-zinc-100 text-zinc-600',
};

const statusClasses = {
  'To Do': 'bg-zinc-100 text-zinc-700',
  'In Progress': 'bg-zinc-950 text-white',
  Testing: 'border border-zinc-500 bg-white text-zinc-800',
  Completed: 'bg-zinc-100 text-zinc-700',
  Blocked: 'bg-zinc-950 text-white',
};

function Badge({ children, className }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

export function MyTaskCard({ task }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-zinc-950">{task.title}</h3>
          <p className="mt-1 text-xs font-medium text-zinc-500">{task.venture}</p>
        </div>
        <Badge className={priorityClasses[task.priority]}>{task.priority}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">{task.category}</span>
        <Badge className={statusClasses[task.status]}>{task.status}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500">
        <CalendarDays className="h-4 w-4" />
        Due {task.dueDate}
      </div>
    </article>
  );
}
