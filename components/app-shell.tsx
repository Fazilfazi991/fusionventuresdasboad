import Link from "next/link";
import { BarChart3, ClipboardList, Inbox, ListChecks, LogOut, Megaphone, Settings, UserPlus } from "lucide-react";

const navItems = [
  { href: "/dashboard/email", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/email/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/email/leads", label: "Leads", icon: UserPlus },
  { href: "/dashboard/email/review", label: "Review", icon: ClipboardList },
  { href: "/dashboard/email/queue", label: "Queue", icon: ListChecks },
  { href: "/dashboard/email/follow-ups", label: "Follow-ups", icon: Inbox },
  { href: "/dashboard/email/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/email/settings", label: "Settings", icon: Settings }
];

export function AppShell({
  children,
  logoutAction
}: {
  children: React.ReactNode;
  logoutAction: () => Promise<void>;
}) {
  return (
    <div className="min-h-screen bg-cloud">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 md:block">
        <div className="px-2">
          <p className="text-lg font-bold">Outreach Desk</p>
          <p className="text-xs text-muted">Private agency tool</p>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-cloud hover:text-ink">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="absolute bottom-5 left-4 right-4">
          <button className="btn-secondary w-full" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <p className="font-bold">Outreach Desk</p>
            <form action={logoutAction}>
              <button className="rounded-md border border-line p-2" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-md border border-line px-3 py-2 text-xs font-semibold">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
