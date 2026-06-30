import { useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { LeadKpiCard } from '../components/LeadKpiCard.jsx';
import { LeadFormDrawer } from '../components/LeadFormDrawer.jsx';
import { LeadsByFilter } from '../components/LeadsByFilter.jsx';
import { LeadStatusFilters } from '../components/LeadStatusFilters.jsx';
import { LeadsTable } from '../components/LeadsTable.jsx';
import { webDevLeadFilters, webDevLeadKpis, webDevLeads } from '../data/dashboardData.js';

const formatCurrency = (value) => `AED ${new Intl.NumberFormat('en-US').format(value)}`;

function calculateTotals(leads) {
  return leads.reduce(
    (totals, lead) => {
      totals.estimated += lead.estimated;
      totals.received += lead.received;
      totals.balance += lead.estimated - lead.received;
      return totals;
    },
    { estimated: 0, received: 0, balance: 0 },
  );
}

function matchesStatusFilter(lead, filter) {
  if (filter === 'All') return true;
  if (filter === 'Payment Pending') return lead.estimated - lead.received > 0;
  if (filter === 'Work Started') return lead.workStatus === 'Work Started';
  if (filter === 'Completed') return lead.leadStatus === 'Completed' || lead.workStatus === 'Completed';
  return lead.leadStatus === filter || lead.workStatus === filter;
}

export function WebDevLeads() {
  const [search, setSearch] = useState('');
  const [leadBy, setLeadBy] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leads, setLeads] = useState(() =>
    webDevLeads.map((lead, index) => ({
      id: `lead-${index + 1}`,
      ...lead,
      balance: lead.estimated - lead.received,
    })),
  );
  const [drawerMode, setDrawerMode] = useState(null);
  const [draftLead, setDraftLead] = useState(null);

  const enrichedLeads = useMemo(
    () => leads.map((lead) => ({ ...lead, balance: Number(lead.estimated || 0) - Number(lead.received || 0) })),
    [leads],
  );

  const allTotals = useMemo(() => {
    const totals = calculateTotals(enrichedLeads);
    return {
      ...totals,
      clients: enrichedLeads.length,
      followUps: enrichedLeads.filter((lead) => lead.leadStatus === 'Follow-up').length,
    };
  }, [enrichedLeads]);

  const leadByCounts = useMemo(
    () => ({
      All: enrichedLeads.length,
      Ayisha: enrichedLeads.filter((lead) => lead.leadBy === 'Ayisha').length,
      Fazil: enrichedLeads.filter((lead) => lead.leadBy === 'Fazil').length,
      Thameem: enrichedLeads.filter((lead) => lead.leadBy === 'Thameem').length,
    }),
    [enrichedLeads],
  );

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedLeads.filter((lead) => {
      const matchesPerson = leadBy === 'All' || lead.leadBy === leadBy;
      const matchesStatus = matchesStatusFilter(lead, statusFilter);
      const searchable = [
        lead.client,
        lead.service,
        lead.leadStatus,
        lead.workStatus,
        lead.nextAction,
        lead.leadBy,
        lead.notes,
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesPerson && matchesStatus && matchesSearch;
    });
  }, [enrichedLeads, leadBy, search, statusFilter]);

  const filteredTotals = useMemo(() => calculateTotals(filteredLeads), [filteredLeads]);

  const kpiValues = {
    estimated: formatCurrency(allTotals.estimated),
    received: formatCurrency(allTotals.received),
    balance: formatCurrency(allTotals.balance),
    clients: allTotals.clients,
    followUps: allTotals.followUps,
  };

  const openAddLead = () => {
    setDraftLead({
      id: `lead-${Date.now()}`,
      client: '',
      service: '',
      contactPerson: '',
      phone: '',
      email: '',
      source: '',
      estimated: '',
      received: '',
      leadStatus: 'New Lead',
      workStatus: 'Not Started',
      leadBy: 'Ayisha',
      followUpDate: '',
      nextAction: '',
      notes: '',
    });
    setDrawerMode('add');
  };

  const openEditLead = (lead) => {
    setDraftLead({ ...lead });
    setDrawerMode('edit');
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setDraftLead(null);
  };

  const handleDrawerSave = (nextLead, commit) => {
    setDraftLead(nextLead);
    if (!commit) return;

    const normalizedLead = {
      ...nextLead,
      estimated: Number(nextLead.estimated) || 0,
      received: Number(nextLead.received) || 0,
      balance: (Number(nextLead.estimated) || 0) - (Number(nextLead.received) || 0),
    };

    setLeads((current) => {
      if (drawerMode === 'add') return [...current, normalizedLead];
      return current.map((lead) => (lead.id === normalizedLead.id ? normalizedLead : lead));
    });
    closeDrawer();
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">Web Dev Leads</h1>
          <p className="mt-2 text-base text-zinc-500">Track all web development leads, payments and work status</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 text-zinc-500 shadow-sm sm:w-[340px] lg:w-[400px]">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full min-w-0 border-0 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
              placeholder="Search leads, clients, notes..."
            />
          </label>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <button
            type="button"
            onClick={openAddLead}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {webDevLeadKpis.map((kpi) => (
          <LeadKpiCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpiValues[kpi.key]} />
        ))}
      </section>

      <LeadsByFilter counts={leadByCounts} active={leadBy} onChange={setLeadBy} />

      <LeadStatusFilters filters={webDevLeadFilters} active={statusFilter} onChange={setStatusFilter} />

      <LeadsTable leads={filteredLeads} totals={filteredTotals} onEdit={openEditLead} />

      <LeadFormDrawer mode={drawerMode} lead={draftLead} onClose={closeDrawer} onSave={handleDrawerSave} />
    </div>
  );
}
