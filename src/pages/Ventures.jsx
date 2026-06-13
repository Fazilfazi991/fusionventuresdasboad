import { FilterTabs } from '../components/FilterTabs.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { VentureCard } from '../components/VentureCard.jsx';
import { ventureCards, ventureFilters, ventureSummary } from '../data/dashboardData.js';

export function Ventures() {
  return (
    <>
      <PageHeader />

      <section className="mt-7">
        <FilterTabs filters={ventureFilters} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ventureSummary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ventureCards.map((venture) => (
          <VentureCard key={venture.name} venture={venture} />
        ))}
      </section>
    </>
  );
}
