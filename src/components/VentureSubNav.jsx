import { Blocks, CheckSquare, FileText, FlaskConical, LayoutDashboard, Link2, MessageSquareText } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'blockers', label: 'Blockers', icon: Blocks },
  { id: 'updates', label: 'Updates', icon: MessageSquareText },
  { id: 'files', label: 'Files / Links', icon: Link2 },
];

export function VentureSubNav({ activeTab, onChange }) {
  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm lg:sticky lg:top-5 lg:h-fit">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex h-11 shrink-0 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium transition ${
                active
                  ? 'border-l-zinc-950 bg-zinc-100 text-zinc-950'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
