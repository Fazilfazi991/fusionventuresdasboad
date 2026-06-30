"use client";

import { useState } from "react";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import type { EmailPreviewData } from "@/lib/types";
import type { Lead } from "@/lib/types";

type Action = (formData: FormData) => void | Promise<void>;

export function CampaignAssignedLeadsTable({
  campaignId,
  leads,
  emailPreviews,
  generateSelectedAction,
  regenerateAction,
  approveSelectedAction,
  removeSelectedAction,
  closeSelectedAction,
  updateStatusAction
}: {
  campaignId: string;
  leads: Lead[];
  emailPreviews: Record<string, { generated: EmailPreviewData | null; queued: EmailPreviewData | null; sent: EmailPreviewData | null }>;
  generateSelectedAction: Action;
  regenerateAction: Action;
  approveSelectedAction: Action;
  removeSelectedAction: Action;
  closeSelectedAction: Action;
  updateStatusAction: Action;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedSet = new Set(selected);
  const allSelected = leads.length > 0 && leads.every((lead) => selectedSet.has(lead.id));

  function toggleLead(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : leads.map((lead) => lead.id));
  }

  function HiddenSelected() {
    return (
      <>
        <input type="hidden" name="campaignId" value={campaignId} />
        {selected.map((id) => (
          <input key={id} type="hidden" name="leadIds" value={id} />
        ))}
      </>
    );
  }

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-line p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Assigned campaign leads</h2>
            <p className="text-sm text-muted">Bulk actions organize and prepare leads only. Sending still happens through Queue automation.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={generateSelectedAction}>
              <HiddenSelected />
              <button className="btn-secondary" disabled={!selected.length}>Generate emails for selected</button>
            </form>
            <form action={approveSelectedAction}>
              <HiddenSelected />
              <button className="btn-secondary" disabled={!selected.length}>Approve selected generated emails</button>
            </form>
            <form action={removeSelectedAction}>
              <HiddenSelected />
              <button className="btn-secondary" disabled={!selected.length}>Remove selected</button>
            </form>
            <form action={closeSelectedAction}>
              <HiddenSelected />
              <button className="btn-danger" disabled={!selected.length}>Mark selected closed</button>
            </form>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{selected.length} selected</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-cloud text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all campaign leads" />
              </th>
              <th className="px-4 py-3">Business name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sequence</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Next action</th>
              <th className="px-4 py-3">Last sent</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const previews = emailPreviews[lead.id] || { generated: null, queued: null, sent: null };
              return (
              <tr key={lead.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedSet.has(lead.id)} onChange={() => toggleLead(lead.id)} aria-label={`Select ${lead.business_name}`} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{lead.business_name}</p>
                  <p className="text-xs text-muted">{lead.contact_name || "No contact"}</p>
                  {lead.website ? <p className="text-xs text-muted">{lead.website}</p> : null}
                </td>
                <td className="px-4 py-3">{lead.email}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">{lead.sequence_status || "new"}</td>
                <td className="px-4 py-3">{lead.current_step || "None"}</td>
                <td className="px-4 py-3">{lead.next_action_at ? new Date(lead.next_action_at).toLocaleString() : "None"}</td>
                <td className="px-4 py-3">{lead.last_sent_at ? new Date(lead.last_sent_at).toLocaleString() : "Never"}</td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    {previews.generated ? (
                      <>
                        <EmailPreviewModal email={previews.generated} label="View Email" />
                        <EmailPreviewModal email={previews.generated} label="Edit Email" />
                        <form action={regenerateAction}>
                          <input type="hidden" name="campaignId" value={campaignId} />
                          <input type="hidden" name="leadId" value={lead.id} />
                          <button className="btn-secondary text-xs">Regenerate Email</button>
                        </form>
                      </>
                    ) : null}
                    {previews.queued ? <EmailPreviewModal email={previews.queued} label="View Queued Email" /> : null}
                    {previews.sent ? <EmailPreviewModal email={previews.sent} label="View Sent Email" /> : null}
                    <form action={generateSelectedAction}>
                      <input type="hidden" name="campaignId" value={campaignId} />
                      <input type="hidden" name="leadIds" value={lead.id} />
                      <button className="btn-secondary text-xs">Generate email</button>
                    </form>
                    {[
                      ["replied", "Mark replied"],
                      ["interested", "Mark interested"],
                      ["not_interested", "Mark not interested"],
                      ["closed", "Mark closed"]
                    ].map(([status, label]) => (
                      <form key={status} action={updateStatusAction}>
                        <input type="hidden" name="campaignId" value={campaignId} />
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="text-left text-xs font-semibold text-muted hover:text-ink">{label}</button>
                      </form>
                    ))}
                    <form action={removeSelectedAction}>
                      <input type="hidden" name="campaignId" value={campaignId} />
                      <input type="hidden" name="leadIds" value={lead.id} />
                      <button className="text-left text-xs font-semibold text-rose">Remove from campaign</button>
                    </form>
                  </div>
                </td>
              </tr>
              );
            })}
            {!leads.length ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
                  No assigned leads yet. Use the Assign Leads panel to add test leads to this campaign.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
