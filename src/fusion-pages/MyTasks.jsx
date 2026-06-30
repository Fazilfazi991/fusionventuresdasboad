import { useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { RecentActivityCard } from '../components/RecentActivityCard.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import { TaskFilterTabs } from '../components/TaskFilterTabs.jsx';
import { TaskFormDrawer } from '../components/TaskFormDrawer.jsx';
import { TaskSummaryCard } from '../components/TaskSummaryCard.jsx';
import { TodayAgendaCard } from '../components/TodayAgendaCard.jsx';
import { WorkloadSummaryCard } from '../components/WorkloadSummaryCard.jsx';
import { myTasks, taskFilters } from '../data/dashboardData.js';
import { CalendarClock, CheckCircle2, ClipboardList, Clock3 } from 'lucide-react';

const ventureNames = [
  'Dearelle',
  'Invitation Builder',
  'Plumlet',
  'Website Builder',
  'Web Development',
  'Education System',
  'Resume Builder',
  'Portfolio Builder',
];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDueDate(value) {
  if (!value) return null;
  const hasYear = /\d{4}/.test(value);
  const parsed = new Date(hasYear ? value : `${value} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function isToday(value) {
  const due = parseDueDate(value);
  if (!due) return false;
  return due.getTime() === startOfDay(new Date()).getTime();
}

function isUpcoming(value) {
  const due = parseDueDate(value);
  if (!due) return false;
  return due.getTime() > startOfDay(new Date()).getTime();
}

function isThisWeek(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = startOfDay(new Date());
  const day = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - day);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function normalizeInitialTasks() {
  const now = new Date().toISOString();
  return myTasks.map((task, index) => ({
    ...task,
    notes: task.notes || '',
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
    completedAt: task.status === 'Completed' ? task.completedAt || now : undefined,
    id: task.id || `task-${index + 1}`,
  }));
}

export function MyTasks() {
  const [tasks, setTasks] = useState(normalizeInitialTasks);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [drawerMode, setDrawerMode] = useState(null);
  const [draftTask, setDraftTask] = useState(null);
  const [activity, setActivity] = useState([]);

  const addActivity = (message) => {
    setActivity((current) => [`You ${message}`, ...current].slice(0, 5));
  };

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        [task.title, task.venture, task.category, task.status, task.priority, task.notes]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Today' && isToday(task.dueDate)) ||
        (activeFilter === 'Upcoming' && isUpcoming(task.dueDate)) ||
        task.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, search, tasks]);

  const summary = useMemo(
    () => [
      { label: 'Assigned Tasks', value: tasks.length, icon: ClipboardList },
      { label: 'In Progress', value: tasks.filter((task) => task.status === 'In Progress').length, icon: Clock3 },
      { label: 'Due Today', value: tasks.filter((task) => isToday(task.dueDate)).length, icon: CalendarClock },
      {
        label: 'Completed This Week',
        value: tasks.filter((task) => task.status === 'Completed' && isThisWeek(task.completedAt || task.updatedAt)).length,
        icon: CheckCircle2,
      },
    ],
    [tasks],
  );

  const agenda = useMemo(
    () =>
      tasks
        .filter((task) => isToday(task.dueDate))
        .map((task) => ({
          time: task.dueTime || 'Today',
          task: task.title,
          venture: task.venture,
        })),
    [tasks],
  );

  const workload = useMemo(
    () =>
      ventureNames.map((venture) => ({
        venture,
        tasks: tasks.filter((task) => task.venture === venture).length,
      })),
    [tasks],
  );

  const openAddTask = () => {
    setDraftTask({
      title: '',
      venture: 'Dearelle',
      category: 'Development',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      notes: '',
    });
    setDrawerMode('add');
  };

  const openEditTask = (task) => {
    setDraftTask({ ...task });
    setDrawerMode('edit');
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setDraftTask(null);
  };

  const saveTask = (nextTask, commit) => {
    setDraftTask(nextTask);
    if (!commit) return;

    const now = new Date().toISOString();
    const normalizedTask = {
      ...nextTask,
      updatedAt: now,
      completedAt: nextTask.status === 'Completed' ? nextTask.completedAt || now : undefined,
    };

    setTasks((current) => {
      if (drawerMode === 'add') return [...current, normalizedTask];
      return current.map((task) => (task.id === normalizedTask.id ? normalizedTask : task));
    });

    addActivity(drawerMode === 'add' ? `created "${normalizedTask.title}"` : `edited "${normalizedTask.title}"`);
    closeDrawer();
  };

  const updateStatus = (taskId, status) => {
    const now = new Date().toISOString();
    let changedTask;
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        changedTask = task;
        return {
          ...task,
          status,
          updatedAt: now,
          completedAt: status === 'Completed' ? now : undefined,
        };
      }),
    );
    if (changedTask) addActivity(`moved "${changedTask.title}" to ${status}`);
  };

  const deleteTask = (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setTasks((current) => current.filter((item) => item.id !== task.id));
    addActivity(`deleted "${task.title}"`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">My Tasks</h1>
          <p className="mt-2 text-base text-zinc-500">Tasks assigned to me across all ventures</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 text-zinc-500 shadow-sm sm:w-[320px] lg:w-[380px]">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full min-w-0 border-0 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
              placeholder="Search my tasks..."
            />
          </label>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          <button
            type="button"
            onClick={openAddTask}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <TaskSummaryCard key={item.label} {...item} />
        ))}
      </section>

      <TaskFilterTabs filters={taskFilters} active={activeFilter} onChange={setActiveFilter} />

      <TaskBoard tasks={filteredTasks} onEdit={openEditTask} onStatusChange={updateStatus} onDelete={deleteTask} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <TodayAgendaCard agenda={agenda} />
        <RecentActivityCard activity={activity} />
        <WorkloadSummaryCard workload={workload} />
      </section>

      <TaskFormDrawer mode={drawerMode} task={draftTask} onClose={closeDrawer} onSave={saveTask} />
    </div>
  );
}
