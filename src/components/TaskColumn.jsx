import { MyTaskCard } from './MyTaskCard.jsx';

export function TaskColumn({ title, tasks, onEdit, onStatusChange, onDelete }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600">
          {tasks.length}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length ? (
          tasks.map((task) => (
            <MyTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-4 text-center text-xs font-medium text-zinc-400">
            Empty
          </div>
        )}
      </div>
    </section>
  );
}
