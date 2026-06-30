import { SearchCheck, Sparkles } from "lucide-react";
import { BulkGenerateButton } from "@/components/bulk-generate-button";
import { CsvUpload } from "@/components/csv-upload";
import { LeadForm } from "@/components/lead-form";
import { SetupWarning } from "@/components/setup-warning";
import { ToastBanner } from "@/components/toast-banner";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { isDatabaseReady, listGeneratedEmailPreviews, listLeads, listQueueEmailPreviews, listSentEmailPreviews } from "@/lib/db";
import type { EmailPreviewData } from "@/lib/types";
import { updateLeadSequenceStatus } from "@/app/dashboard/email/leads/actions";
import { generateAuditAngle, generateForAllNewLeads, generateForLead } from "@/app/dashboard/email/review/actions";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ toast?: string; count?: string }> }) {
  const params = await searchParams;
  const [databaseReady, leads, generatedPreviews, queuePreviews, sentPreviews] = await Promise.all([
    isDatabaseReady(),
    listLeads(),
    listGeneratedEmailPreviews(),
    listQueueEmailPreviews(),
    listSentEmailPreviews()
  ]);
  const previewByLead = new Map<string, EmailPreviewData>();
  for (const item of generatedPreviews) previewByLead.set(item.leadId, item);
  for (const item of queuePreviews) previewByLead.set(item.leadId, item);
  for (const item of sentPreviews) previewByLead.set(item.leadId, item);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted">Add leads manually or import CSV rows. Duplicate emails are ignored.</p>
      </div>
      <SetupWarning ready={databaseReady} />
      <ToastBanner toast={params.toast} count={params.count} />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Lead List</h2>
              <BulkGenerateButton action={generateForAllNewLeads} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cloud text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Manual outcome</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <p className="font-medium">{lead.business_name}</p>
                      <p className="text-xs text-muted">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3">{lead.service_to_pitch}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-cloud px-2 py-1 text-xs font-semibold text-muted">{lead.sequence_status || lead.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateLeadSequenceStatus} className="flex gap-2">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <select name="status" className="min-w-36 text-xs">
                          <option value="replied">Replied</option>
                          <option value="interested">Interested</option>
                          <option value="not_interested">Not interested</option>
                          <option value="converted">Converted</option>
                          <option value="unsubscribed">Unsubscribed</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button className="btn-secondary text-xs" type="submit">Update</button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                      <EmailPreviewModal email={previewByLead.get(lead.id) || null} label="View Email" className="btn-secondary" />
                      <form action={generateAuditAngle}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <input type="hidden" name="returnTo" value="/dashboard/email/leads" />
                        <button className="btn-secondary">
                          <SearchCheck className="h-4 w-4" />
                          Audit
                        </button>
                      </form>
                      <form action={generateForLead}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <button className="btn-secondary" disabled={["Draft Created", "Sent", "Converted"].includes(lead.status)}>
                          <Sparkles className="h-4 w-4" />
                          Generate
                        </button>
                      </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {!leads.length ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-muted" colSpan={5}>
                      Add your first dummy lead or upload a CSV to test the full flow.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-5">
          <CsvUpload />
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
