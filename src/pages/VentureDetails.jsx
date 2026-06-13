import { useMemo, useState } from 'react';
import { Ban, CheckCircle2, CheckSquare, Circle, Clock3, FlaskConical } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DetailSummaryCard } from '../components/DetailSummaryCard.jsx';
import { DetailTable, StatusBadge } from '../components/DetailTable.jsx';
import { FilesLinksCard } from '../components/FilesLinksCard.jsx';
import { OverviewCard } from '../components/OverviewCard.jsx';
import { UpdatesTimeline } from '../components/UpdatesTimeline.jsx';
import { VentureDetailHeader } from '../components/VentureDetailHeader.jsx';
import { VentureSubNav } from '../components/VentureSubNav.jsx';
import { ventureDetails } from '../data/dashboardData.js';

const taskColumns = [
  { key: 'task', label: 'Task' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'due', label: 'Due' },
];

const testingColumns = [
  { key: 'item', label: 'Test Item' },
  { key: 'area', label: 'Area' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
];

const blockerColumns = [
  { key: 'blocker', label: 'Blocker' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
];

function CompactRows({ rows, type }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.task || row.item} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Circle className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate text-zinc-800">{row.task || row.item}</span>
          </div>
          <StatusBadge value={type === 'task' ? row.status : row.status} />
        </div>
      ))}
    </div>
  );
}

function OverviewTab({ venture }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <OverviewCard title="Current Focus">
        <ul className="space-y-3 text-sm text-zinc-700">
          {venture.currentFocus.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
              {item}
            </li>
          ))}
        </ul>
      </OverviewCard>

      <OverviewCard title="Pending Tasks" action="View all">
        <CompactRows rows={venture.pendingTasks.slice(0, 5)} type="task" />
      </OverviewCard>

      <OverviewCard title="Testing Checklist" action="View all">
        <CompactRows rows={venture.testingChecklist.slice(0, 5)} type="testing" />
      </OverviewCard>

      <OverviewCard title="Blockers" action={venture.blockers.length ? 'View all' : null}>
        {venture.blockers.length ? (
          <div className="space-y-3">
            {venture.blockers.map((blocker) => (
              <div key={blocker.blocker} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm">
                <span className="font-medium text-zinc-800">{blocker.blocker}</span>
                <StatusBadge value={blocker.priority} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm font-medium text-zinc-500">
            No blockers currently.
          </p>
        )}
      </OverviewCard>

      <OverviewCard title="Recent Updates">
        <div className="space-y-4">
          {venture.updates.slice(0, 3).map((update) => (
            <div key={`${update.text}-${update.time}`} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-zinc-800">{update.text}</span>
              <span className="shrink-0 text-xs font-medium text-zinc-500">{update.time}</span>
            </div>
          ))}
        </div>
      </OverviewCard>

      <OverviewCard title="Files / Links">
        <FilesLinksCard files={venture.files.slice(0, 4)} />
      </OverviewCard>
    </div>
  );
}

function DetailContent({ activeTab, venture }) {
  if (activeTab === 'overview') return <OverviewTab venture={venture} />;
  if (activeTab === 'tasks') return <DetailTable columns={taskColumns} rows={venture.pendingTasks} />;
  if (activeTab === 'testing') return <DetailTable columns={testingColumns} rows={venture.testingChecklist} />;
  if (activeTab === 'blockers') {
    return <DetailTable columns={blockerColumns} rows={venture.blockers} emptyText="No blockers currently." />;
  }
  if (activeTab === 'updates') return <UpdatesTimeline updates={venture.updates} />;
  if (activeTab === 'files') return <FilesLinksCard files={venture.files} />;
  return null;
}

export function VentureDetails() {
  const { ventureId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const venture = useMemo(
    () => ventureDetails.find((item) => item.id === ventureId || item.aliases?.includes(ventureId)),
    [ventureId],
  );

  if (!venture) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-950">Venture not found</h1>
        <p className="mt-3 text-zinc-500">The venture you are looking for does not exist in Fusion OS yet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <VentureDetailHeader venture={venture} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <VentureSubNav activeTab={activeTab} onChange={setActiveTab} />
        <div className="min-w-0 space-y-5">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DetailSummaryCard icon={Clock3} label="Pending Tasks" value={venture.summary.pendingTasks} />
            <DetailSummaryCard icon={FlaskConical} label="Testing Items" value={venture.summary.testingItems} />
            <DetailSummaryCard
              icon={Ban}
              label="Blocked Items"
              value={venture.summary.blockedItems}
              tone={venture.summary.blockedItems > 0 ? 'red' : 'green'}
            />
            <DetailSummaryCard icon={CheckCircle2} label="Completed" value={venture.summary.completed} tone="green" />
          </section>

          <DetailContent activeTab={activeTab} venture={venture} />
        </div>
      </div>
    </div>
  );
}
