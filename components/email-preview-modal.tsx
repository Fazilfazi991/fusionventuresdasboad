"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, Edit3, Eye, X } from "lucide-react";
import { saveEmailEdits } from "@/app/dashboard/email/email-actions";
import type { EmailPreviewData } from "@/lib/types";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "None";
}

function hasTemplateFallback(email: EmailPreviewData) {
  return (email.generationProvider || "").toLowerCase() === "template";
}

export function EmailPreviewModal({
  email,
  label,
  className = "btn-secondary text-xs"
}: {
  email: EmailPreviewData | null;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const sent = email?.source === "sent" || email?.status === "sent";
  const editable = Boolean(email && !sent && (email.source === "generated" || (email.source === "queue" && email.status === "queued")));

  const fullEmail = useMemo(() => {
    if (!email) return "";
    return `Subject: ${email.subject}\n\n${email.body}`;
  }, [email]);

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(message);
    } catch {
      setCopyMessage("Copy failed. Select the text manually.");
    }
  }

  return (
    <>
      <button className={className} type="button" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 className="text-xl font-semibold">{email?.leadName || "Email preview"}</h2>
                <p className="text-sm text-muted">{email?.recipientEmail || "No generated email found for this lead yet."}</p>
              </div>
              <button className="btn-secondary px-3" type="button" onClick={() => setOpen(false)} aria-label="Close email preview">
                <X className="h-4 w-4" />
              </button>
            </div>
            {!email ? (
              <div className="p-8 text-center text-sm text-muted">No generated email found for this lead yet.</div>
            ) : (
              <div className="max-h-[calc(92vh-84px)] overflow-y-auto p-5">
                {hasTemplateFallback(email) ? (
                  <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Warning: this email was generated using the template fallback.
                  </div>
                ) : null}
                {email.errorMessage ? (
                  <div className="mb-4 rounded-md border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-ink">
                    <p className="font-semibold">Provider or queue error</p>
                    <p className="mt-1 text-muted">{email.errorMessage}</p>
                  </div>
                ) : null}
                <div className="grid gap-3 text-sm md:grid-cols-4">
                  <p><span className="field-label">Campaign</span><br />{email.campaignName}</p>
                  <p><span className="field-label">Step</span><br />{email.step}</p>
                  <p><span className="field-label">Generation provider</span><br />{email.generationProvider || "Unknown"}</p>
                  <p><span className="field-label">Status</span><br />{email.status}</p>
                  <p><span className="field-label">Scheduled at</span><br />{formatDate(email.scheduledAt)}</p>
                  <p><span className="field-label">Sent at</span><br />{formatDate(email.sentAt)}</p>
                  <p className="md:col-span-2"><span className="field-label">Resend provider message id</span><br />{email.providerMessageId || "None"}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => copyText(email.subject, "Subject copied.")}>
                    <Copy className="h-4 w-4" />
                    Copy subject
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => copyText(email.body, "Body copied.")}>
                    <Copy className="h-4 w-4" />
                    Copy body
                  </button>
                  <button className="btn-secondary" type="button" onClick={() => copyText(fullEmail, "Full email copied.")}>
                    <Copy className="h-4 w-4" />
                    Copy full email
                  </button>
                  {editable ? (
                    <button className="btn-secondary" type="button" onClick={() => setEditing((value) => !value)}>
                      <Edit3 className="h-4 w-4" />
                      {editing ? "Preview email" : "Edit email"}
                    </button>
                  ) : null}
                  {copyMessage ? <p className="self-center text-sm text-muted">{copyMessage}</p> : null}
                </div>
                {editing && editable ? (
                  <form
                    className="mt-5 grid gap-4"
                    action={(formData) => {
                      startTransition(async () => {
                        await saveEmailEdits(formData);
                        setEditing(false);
                      });
                    }}
                  >
                    <input type="hidden" name="source" value={email.source} />
                    <input type="hidden" name="id" value={email.id} />
                    <input type="hidden" name="generatedEmailId" value={email.generatedEmailId || ""} />
                    <input type="hidden" name="step" value={email.step} />
                    <label>
                      <span className="field-label">Subject</span>
                      <input name="subject" defaultValue={email.subject} className="mt-1 w-full" />
                    </label>
                    <label>
                      <span className="field-label">Body</span>
                      <textarea name="body" defaultValue={email.body} className="mt-1 min-h-72 w-full" />
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label>
                        <span className="field-label">Follow-up 1</span>
                        <textarea name="followUp1" defaultValue={email.followUp1 || ""} className="mt-1 min-h-36 w-full" />
                      </label>
                      <label>
                        <span className="field-label">Follow-up 2</span>
                        <textarea name="followUp2" defaultValue={email.followUp2 || ""} className="mt-1 min-h-36 w-full" />
                      </label>
                      <label>
                        <span className="field-label">Follow-up 3</span>
                        <textarea name="followUp3" defaultValue={email.followUp3 || ""} className="mt-1 min-h-36 w-full" />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-primary" type="submit" disabled={pending}>{pending ? "Saving..." : "Save edited email"}</button>
                      <button className="btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel edit</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-5 grid gap-4">
                    <section className="rounded-md border border-line p-4">
                      <p className="field-label">Subject</p>
                      <p className="mt-2 text-base font-semibold">{email.subject || "No subject"}</p>
                    </section>
                    <section className="rounded-md border border-line p-4">
                      <p className="field-label">Body</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{email.body || "No body"}</p>
                    </section>
                    <div className="grid gap-3 md:grid-cols-3">
                      <section className="rounded-md border border-line p-4">
                        <p className="field-label">Follow-up 1</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{email.followUp1 || "None"}</p>
                      </section>
                      <section className="rounded-md border border-line p-4">
                        <p className="field-label">Follow-up 2</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{email.followUp2 || "None"}</p>
                      </section>
                      <section className="rounded-md border border-line p-4">
                        <p className="field-label">Follow-up 3</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{email.followUp3 || "None"}</p>
                      </section>
                    </div>
                    {sent ? <p className="text-sm text-muted">Sent emails are read-only.</p> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
