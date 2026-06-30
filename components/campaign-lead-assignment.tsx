"use client";

import { useMemo, useState } from "react";
import type { Lead } from "@/lib/types";

type AssignmentSummary = {
  assigned?: string;
  skipped?: string;
};

type Action = (formData: FormData) => void | Promise<void>;

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function matchesSearch(lead: Lead, search: string) {
  if (!search.trim()) return true;
  const text = [
    lead.business_name,
    lead.contact_name,
    lead.email,
    lead.website,
    lead.industry,
    lead.location,
    lead.status,
    lead.sequence_status,
    lead.service_to_pitch
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes(search.toLowerCase());
}

export function CampaignLeadAssignment({
  campaignId,
  leads,
  assignSelectedAction,
  assignMatchingAction,
  uploadAction,
  summary
}: {
  campaignId: string;
  leads: Lead[];
  assignSelectedAction: Action;
  assignMatchingAction: Action;
  uploadAction: Action;
  summary?: AssignmentSummary;
}) {
  const [search, setSearch] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(true);
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (unassignedOnly && lead.campaign_id) return false;
      if (industry && lead.industry !== industry) return false;
      if (location && lead.location !== location) return false;
      if (status && lead.status !== status) return false;
      if (service && lead.service_to_pitch !== service) return false;
      return matchesSearch(lead, search);
    });
  }, [leads, search, unassignedOnly, industry, location, status, service]);

  const selectedSet = new Set(selected);
  const visibleIds = filtered.map((lead) => lead.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const allMatchingAlreadyAssigned = filtered.length > 0 && filtered.every((lead) => lead.campaign_id);

  function toggleLead(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function selectAllVisible() {
    setSelected((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  function clearSelection() {
    setSelected([]);
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Assign Leads</h2>
          <p className="text-sm text-muted">Filter hundreds of leads, select the right rows, and assign them without generating or sending anything.</p>
        </div>
        <div className="rounded-md bg-cloud px-3 py-2 text-sm font-semibold">{selected.length} selected</div>
      </div>

      {summary?.assigned ? (
        <div className="mt-4 rounded-md border border-mint/30 bg-mint/10 px-4 py-3 text-sm">
          Assigned {summary.assigned}. Skipped {summary.skipped || "0"}.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        <label className="lg:col-span-2">
          <span className="field-label">Search</span>
          <input className="mt-1 w-full" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Business, email, website, location" />
        </label>
        <label>
          <span className="field-label">Industry</span>
          <select className="mt-1 w-full" value={industry} onChange={(event) => setIndustry(event.target.value)}>
            <option value="">All industries</option>
            {unique(leads.map((lead) => lead.industry)).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Location</span>
          <select className="mt-1 w-full" value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="">All locations</option>
            {unique(leads.map((lead) => lead.location)).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Status</span>
          <select className="mt-1 w-full" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {unique(leads.map((lead) => lead.status)).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Service</span>
          <select className="mt-1 w-full" value={service} onChange={(event) => setService(event.target.value)}>
            <option value="">All services</option>
            {unique(leads.map((lead) => lead.service_to_pitch)).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={unassignedOnly} onChange={(event) => setUnassignedOnly(event.target.checked)} />
          Unassigned only
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className="btn-secondary" type="button" onClick={selectAllVisible} disabled={!visibleIds.length || allVisibleSelected}>
          Select all visible
        </button>
        <button className="btn-secondary" type="button" onClick={clearSelection} disabled={!selected.length}>
          Clear selection
        </button>
        <span className="text-sm text-muted">{filtered.length} matching leads</span>
      </div>

      <div className="mt-4 max-h-[520px] overflow-auto rounded-md border border-line">
        {filtered.map((lead) => (
          <label key={lead.id} className="grid cursor-pointer gap-2 border-b border-line p-4 text-sm last:border-b-0 md:grid-cols-[24px_1.2fr_1fr_1fr_1fr]">
            <input type="checkbox" checked={selectedSet.has(lead.id)} onChange={() => toggleLead(lead.id)} />
            <span>
              <span className="block font-semibold">{lead.business_name}</span>
              <span className="block text-xs text-muted">{lead.contact_name || "No contact"} - {lead.email}</span>
              {lead.website ? <span className="block text-xs text-muted">{lead.website}</span> : null}
            </span>
            <span>{lead.industry || "No industry"}</span>
            <span>{lead.location || "No location"}</span>
            <span>
              <span className="block">{lead.status}</span>
              <span className="block text-xs text-muted">{lead.service_to_pitch}</span>
              {lead.campaign_id ? <span className="mt-1 inline-block rounded-md bg-amber/10 px-2 py-1 text-xs">Already assigned</span> : null}
            </span>
          </label>
        ))}
        {!filtered.length ? (
          <div className="p-8 text-center text-sm text-muted">
            {unassignedOnly ? "No unassigned leads found for these filters." : "No leads match this filter."}
          </div>
        ) : null}
        {allMatchingAlreadyAssigned ? <div className="p-4 text-center text-sm text-muted">All matching leads are already assigned.</div> : null}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <form action={assignSelectedAction} className="rounded-md border border-line p-4">
          <input type="hidden" name="campaignId" value={campaignId} />
          {selected.map((id) => (
            <input key={id} type="hidden" name="leadIds" value={id} />
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input name="reassign" type="checkbox" />
            Reassign leads already in another campaign
          </label>
          <button className="btn-primary mt-3" type="submit" disabled={!selected.length}>
            Assign selected leads
          </button>
        </form>

        <form
          action={assignMatchingAction}
          className="rounded-md border border-line p-4"
          onSubmit={(event) => {
            if (!confirm(`Assign ${filtered.length} matching leads to this campaign?`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="search" value={search} />
          <input type="hidden" name="unassignedOnly" value={String(unassignedOnly)} />
          <input type="hidden" name="industry" value={industry} />
          <input type="hidden" name="location" value={location} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="service_to_pitch" value={service} />
          <label className="flex items-center gap-2 text-sm">
            <input name="reassign" type="checkbox" />
            Reassign leads already in another campaign
          </label>
          <button className="btn-secondary mt-3" type="submit" disabled={!filtered.length}>
            Assign all matching filters
          </button>
        </form>
      </div>

      <form action={uploadAction} className="mt-5 rounded-md border border-line p-4">
        <input type="hidden" name="campaignId" value={campaignId} />
        <h3 className="font-semibold">Upload leads to this campaign</h3>
        <p className="mt-1 text-sm text-muted">CSV rows are assigned to this campaign, duplicates by email are skipped, and no emails are generated.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input name="file" type="file" accept=".csv" required className="w-full" />
          <button className="btn-secondary" type="submit">Upload leads</button>
        </div>
      </form>
    </section>
  );
}
