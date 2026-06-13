import { ArrowRight, Ban, Clock3, FlaskConical } from 'lucide-react';
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

function Stat({ icon: Icon, label, value, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'border-zinc-100 bg-zinc-50 text-zinc-950',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    red: 'border-red-100 bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

export function VentureCard({ venture }) {
  const Icon = venture.icon;

  return (
    <article className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge className={stageClasses[venture.stage]}>{venture.stage}</Badge>
          <Badge className={priorityClasses[venture.priority]}>{venture.priority}</Badge>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-semibold text-zinc-950">{venture.name}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500">{venture.description}</p>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-600">Progress</span>
          <span className="font-semibold text-zinc-950">{venture.progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full ${venture.progress >= 80 ? 'bg-emerald-600' : 'bg-zinc-900'}`}
            style={{ width: `${venture.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={Clock3} label="Pending" value={venture.pending} />
        <Stat icon={FlaskConical} label="Testing" value={venture.testing} />
        <Stat icon={Ban} label="Blocked" value={venture.blocked} tone={venture.blocked > 0 ? 'red' : 'green'} />
      </div>

      <div className="mt-6 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Next Action</p>
        <p className="mt-2 text-sm font-medium leading-6 text-zinc-800">{venture.nextAction}</p>
      </div>

      <Link
        to={`/ventures/${venture.id}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 transition group-hover:gap-3"
      >
        View Details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
