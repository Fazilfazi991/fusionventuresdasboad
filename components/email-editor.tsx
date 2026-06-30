import { CheckCircle2, RotateCcw, SearchCheck, SkipForward } from "lucide-react";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { findUnresolvedPlaceholders } from "@/lib/placeholders";
import type { AgencySettings, EmailPreviewData, GeneratedEmail, Lead } from "@/lib/types";
import { approveEmail, generateAuditAngle, regenerateWithAi, regenerateWithTemplate, skipLead } from "@/app/dashboard/email/review/actions";

export function EmailEditor({
  item,
  settings,
  aiAvailable,
  preview
}: {
  item: GeneratedEmail & { leads: Lead };
  settings: AgencySettings | null;
  aiAvailable: boolean;
  preview: EmailPreviewData;
}) {
  const subject = item.edited_subject || item.subject;
  const body = item.edited_body || item.body;
  const senderName = settings?.sender_name || "Fazil";
  const agencyName = settings?.agency_name || "Fusion Ventures";
  const placeholders = findUnresolvedPlaceholders(`${subject}\n${body}`);

  return (
    <article className="panel p-5">
      <div className="flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{item.leads.business_name}</h2>
          <p className="text-sm text-muted">
            {item.leads.contact_name || "No contact"} · {item.leads.email} · {item.leads.service_to_pitch}
          </p>
        </div>
        <span className="w-fit rounded-md bg-cloud px-2 py-1 text-xs font-semibold text-muted">{item.leads.status}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <EmailPreviewModal email={preview} label="View Email" className="btn-secondary" />
        <EmailPreviewModal email={preview} label="Edit Email" className="btn-secondary" />
      </div>
      <div className="mt-4 rounded-md border border-line bg-white p-3 text-sm text-muted">
        Sender preview: <span className="font-semibold text-ink">{senderName}</span> at <span className="font-semibold text-ink">{agencyName}</span>
      </div>
      {item.leads.audit_pitch_angle ? (
        <div className="mt-4 grid gap-3 rounded-md border border-line bg-cloud p-3 text-sm md:grid-cols-2">
          <div>
            <p className="field-label">Problem noticed</p>
            <p className="mt-1">{item.leads.audit_problem}</p>
          </div>
          <div>
            <p className="field-label">Opportunity</p>
            <p className="mt-1">{item.leads.audit_opportunity}</p>
          </div>
          <div>
            <p className="field-label">Pitch angle</p>
            <p className="mt-1">{item.leads.audit_pitch_angle}</p>
          </div>
          <div>
            <p className="field-label">Opening line</p>
            <p className="mt-1">{item.leads.audit_opening_line}</p>
          </div>
        </div>
      ) : null}
      <p className="mt-4 rounded-md bg-cloud p-3 text-sm text-ink">{item.lead_observation}</p>
      {placeholders.length ? (
        <div className="mt-4 rounded-md border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-ink">
          <p className="font-semibold">Unresolved placeholders detected.</p>
          <p className="mt-1 text-muted">Fix these before sending: {placeholders.join(", ")}</p>
        </div>
      ) : null}
      <form id={`review-form-${item.id}`} className="mt-4 grid gap-3">
        <input type="hidden" name="generatedId" value={item.id} />
        <input type="hidden" name="leadId" value={item.lead_id} />
        <label>
          <span className="field-label">Subject</span>
          <input name="subject" defaultValue={subject} className="mt-1 w-full" />
        </label>
        <label>
          <span className="field-label">Email body</span>
          <textarea name="body" defaultValue={body} className="mt-1 min-h-48 w-full" />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-line p-3">
            <p className="field-label">Follow-up 1</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.follow_up_1}</p>
          </div>
          <div className="rounded-md border border-line p-3">
            <p className="field-label">Follow-up 2</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.follow_up_2}</p>
          </div>
          <div className="rounded-md border border-line p-3 md:col-span-2">
            <p className="field-label">Follow-up 3</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.follow_up_3 || "None"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="hidden" name="returnTo" value="/dashboard/email/review" />
          <button className="btn-primary" formAction={approveEmail} disabled={Boolean(placeholders.length)}>
            <CheckCircle2 className="h-4 w-4" />
            Approve and Queue
          </button>
          <button className="btn-secondary" formAction={regenerateWithTemplate}>
            <RotateCcw className="h-4 w-4" />
            Regenerate with Template
          </button>
          {aiAvailable ? (
            <button className="btn-secondary" formAction={regenerateWithAi}>
              <RotateCcw className="h-4 w-4" />
              Regenerate with Gemini
            </button>
          ) : null}
          <button className="btn-secondary" formAction={generateAuditAngle}>
            <SearchCheck className="h-4 w-4" />
            Website audit angle
          </button>
          <button className="btn-secondary" formAction={skipLead}>
            <SkipForward className="h-4 w-4" />
            Skip
          </button>
        </div>
      </form>
    </article>
  );
}
