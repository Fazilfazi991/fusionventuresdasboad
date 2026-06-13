import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const stageClasses = {
  'Launch Prep': 'bg-zinc-950 text-white',
  Testing: 'bg-zinc-500 text-white',
  Development: 'bg-zinc-100 text-zinc-800',
  'Live Service': 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  Planning: 'bg-zinc-50 text-zinc-600',
};

const priorityClasses = {
  'High Priority': 'bg-red-600 text-white',
  'Medium Priority': 'border border-zinc-600 bg-white text-zinc-800',
  'Low Priority': 'bg-emerald-50 text-emerald-700',
};

function Badge({ children, className }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

export function VentureDetailHeader({ venture }) {
  return (
    <header className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Link to="/ventures" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950">
            <ArrowLeft className="h-4 w-4" />
            Back to Ventures
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">{venture.name}</h1>
            <Badge className={stageClasses[venture.stage]}>{venture.stage}</Badge>
            <Badge className={priorityClasses[venture.priority]}>{venture.priority}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{venture.description}</p>
          <div className="mt-5 max-w-xs">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
              <span>Progress</span>
              <span>{venture.progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full ${venture.progress >= 80 ? 'bg-emerald-600' : 'bg-zinc-950'}`}
                style={{ width: `${venture.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:flex">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50">
            <Plus className="h-4 w-4" />
            Add Update
          </button>
        </div>
      </div>
    </header>
  );
}
