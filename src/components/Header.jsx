import { Bell, Menu, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          className="mt-1 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-4xl">Overview</h1>
          <p className="mt-1 text-base text-slate-500">Simple snapshot of ventures and execution</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm md:w-[360px] xl:w-[420px]">
          <Search className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-500"
            placeholder="Search ventures, tasks, leads..."
          />
        </label>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-slate-950 shadow-sm"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute right-2 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-950" />
        </button>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-950 font-bold text-white shadow-lg shadow-zinc-200">
          AM
        </div>
      </div>
    </header>
  );
}
