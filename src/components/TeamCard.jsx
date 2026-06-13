import { UsersRound } from 'lucide-react';

const avatarStyles = [
  'bg-zinc-900',
  'bg-zinc-700',
  'bg-zinc-500',
];

export function TeamCard({ members }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="text-zinc-950">
          <UsersRound className="h-8 w-8" fill="currentColor" fillOpacity={0.14} />
        </div>
        <h2 className="text-lg font-bold text-slate-950">My Team</h2>
      </div>

      <div className="mt-5 space-y-4">
        {members.map((member, index) => (
          <div key={member.name} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
            <div
              className={`grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-white ${avatarStyles[index]}`}
            >
              {member.avatar}
            </div>
            <div className="min-w-0">
              <div className="truncate font-bold text-slate-950">{member.name}</div>
              <div className="truncate text-sm text-slate-500">{member.role}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold leading-none text-zinc-950">{member.tasks}</div>
              <div className="mt-1 text-xs text-slate-500">Active Tasks</div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
