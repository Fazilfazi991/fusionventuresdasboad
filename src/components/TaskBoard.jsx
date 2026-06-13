import { TaskColumn } from './TaskColumn.jsx';

const columns = ['To Do', 'In Progress', 'Testing', 'Completed'];

export function TaskBoard({ tasks }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {columns.map((column) => (
        <TaskColumn key={column} title={column} tasks={tasks.filter((task) => task.status === column)} />
      ))}
    </section>
  );
}
