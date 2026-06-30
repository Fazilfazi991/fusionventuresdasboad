import { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  NotebookPen,
  Search,
  Send,
  Tags,
} from 'lucide-react';
import { emailMarketingLeads } from '../data/emailMarketingLeads.js';

const statusOptions = ['Not send', 'Mail send', 'Not found'];

const statusStyles = {
  'Not send': 'border-zinc-200 bg-zinc-100 text-zinc-700',
  'Mail send': 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'Not found': 'border-red-100 bg-red-50 text-red-700',
};

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-950 text-white">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {helper ? <p className="mt-3 text-xs font-medium text-zinc-500">{helper}</p> : null}
    </article>
  );
}

function statusClass(status) {
  return statusStyles[status] || statusStyles['Not send'];
}

export function EmailMarketing() {
  const [leads, setLeads] = useState(emailMarketingLeads);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(leads.map((lead) => lead.category).filter(Boolean))).sort()],
    [leads],
  );

  const counts = useMemo(() => {
    const contacted = leads.filter((lead) => lead.status === 'Mail send').length;
    const emailLeads = leads.filter((lead) => lead.email?.includes('@')).length;
    const notFound = leads.filter((lead) => lead.status === 'Not found').length;
    return { total: leads.length, emailLeads, contacted, notFound };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesCategory = category === 'All' || lead.category === category;
      const matchesStatus = status === 'All' || lead.status === status;
      const searchable = [lead.company, lead.website, lead.email, lead.category, lead.status, lead.notes]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [category, leads, search, status]);

  const updateLead = (id, updates) => {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)));
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">Email Marketing</h1>
          <p className="mt-2 max-w-2xl text-base text-zinc-500">
            Canada website outreach list with company, email/contact, category, status and notes.
          </p>
        </div>

        <label className="flex h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 text-zinc-500 shadow-sm md:w-[420px]">
          <Search className="h-5 w-5 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full min-w-0 border-0 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400"
            placeholder="Search company, email, category, notes..."
          />
        </label>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Companies" value={counts.total} helper="Total outreach leads" />
        <StatCard icon={Mail} label="Email Contacts" value={counts.emailLeads} helper="Rows with direct emails" />
        <StatCard icon={Send} label="Mail Send" value={counts.contacted} helper="Leads marked as mailed" />
        <StatCard icon={CheckCircle2} label="Not Found" value={counts.notFound} helper="Contacts that need replacement" />
      </section>

      <section className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_220px_220px]">
        <div className="flex min-h-12 items-center gap-3 rounded-lg bg-zinc-50 px-4 text-sm font-medium text-zinc-600">
          <NotebookPen className="h-4 w-4" />
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3">
          <Tags className="h-4 w-4 text-zinc-500" />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full border-0 bg-transparent text-sm font-medium text-zinc-800 outline-none"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3">
          <Clock3 className="h-4 w-4 text-zinc-500" />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 w-full border-0 bg-transparent text-sm font-medium text-zinc-800 outline-none"
          >
            {['All', ...statusOptions].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-collapse text-left">
            <thead className="bg-zinc-50 text-xs uppercase tracking-normal text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Company Name</th>
                <th className="px-4 py-3 font-semibold">Mails</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="align-top transition hover:bg-zinc-50/70">
                  <td className="w-[260px] px-4 py-4">
                    <div className="font-semibold text-zinc-950">{lead.company}</div>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex max-w-[230px] items-center gap-1 truncate text-xs font-medium text-zinc-500 hover:text-zinc-950"
                    >
                      {lead.website}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </td>
                  <td className="w-[260px] px-4 py-4">
                    <a href={`mailto:${lead.email}`} className="font-medium text-zinc-800 hover:text-zinc-950">
                      {lead.email}
                    </a>
                  </td>
                  <td className="w-[190px] px-4 py-4">
                    <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
                      {lead.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="w-[190px] px-4 py-4">
                    <select
                      value={lead.status}
                      onChange={(event) => updateLead(lead.id, { status: event.target.value })}
                      className={`h-10 w-full rounded-lg border px-3 text-xs font-semibold outline-none ${statusClass(lead.status)}`}
                    >
                      {statusOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <textarea
                      value={lead.notes}
                      onChange={(event) => updateLead(lead.id, { notes: event.target.value })}
                      className="min-h-[58px] w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-5 text-zinc-700 outline-none transition focus:border-zinc-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredLeads.length ? (
          <div className="p-8 text-center text-sm font-medium text-zinc-500">No email leads match the current filters.</div>
        ) : null}
      </section>
    </div>
  );
}
