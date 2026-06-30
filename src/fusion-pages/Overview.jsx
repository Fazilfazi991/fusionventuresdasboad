import { Header } from '../components/Header.jsx';
import { KpiCard } from '../components/KpiCard.jsx';
import { RecentUpdatesCard } from '../components/RecentUpdatesCard.jsx';
import { TeamCard } from '../components/TeamCard.jsx';
import { TodayFocusCard } from '../components/TodayFocusCard.jsx';
import { VentureSnapshotTable } from '../components/VentureSnapshotTable.jsx';
import { focusItems, kpis, team, updates, ventures } from '../data/dashboardData.js';

export function Overview() {
  return (
    <>
      <Header />

      <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="mt-5">
        <VentureSnapshotTable ventures={ventures} />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.3fr_1.15fr]">
        <TodayFocusCard items={focusItems} />
        <RecentUpdatesCard updates={updates} />
        <TeamCard members={team} />
      </section>
    </>
  );
}
