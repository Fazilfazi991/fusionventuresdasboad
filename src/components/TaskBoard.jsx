import { TaskColumn } from './TaskColumn.jsx';

export function TaskBoard({ tasks, onEdit, onStatusChange, onDelete }) {
  const columns = ['To Do', 'In Progress', 'Testing', ...(tasks.some((task) => task.status === 'Blocked') ? ['Blocked'] : []), 'Completed'];

  if (!tasks.length) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm font-semibold text-zinc-500">
        No tasks found.
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {columns.map((column) => (
        <TaskColumn
          key={column}
          title={column}
          tasks={tasks.filter((task) => task.status === column)}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
