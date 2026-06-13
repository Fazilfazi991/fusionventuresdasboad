import { Search, SlidersHorizontal } from 'lucide-react';
import { RecentActivityCard } from '../components/RecentActivityCard.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import { TaskFilterTabs } from '../components/TaskFilterTabs.jsx';
import { TaskSummaryCard } from '../components/TaskSummaryCard.jsx';
import { TodayAgendaCard } from '../components/TodayAgendaCard.jsx';
import { WorkloadSummaryCard } from '../components/WorkloadSummaryCard.jsx';
import { myTasks, taskActivity, taskFilters, taskSummary, todayAgenda, workloadSummary } from '../data/dashboardData.js';

export function MyTasks() {
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
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {taskSummary.map((item) => (
          <TaskSummaryCard key={item.label} {...item} />
        ))}
      </section>

      <TaskFilterTabs filters={taskFilters} />

      <TaskBoard tasks={myTasks} />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <TodayAgendaCard agenda={todayAgenda} />
        <RecentActivityCard activity={taskActivity} />
        <WorkloadSummaryCard workload={workloadSummary} />
      </section>
    </div>
  );
}
