"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, X } from "lucide-react";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { findUnresolvedPlaceholders } from "@/lib/placeholders";
import type { EmailPreviewData } from "@/lib/types";

export function RunAutomationButton({
  dueCount,
  dueEmails,
  dailyLimitRemaining
}: {
  dueCount: number;
  dueEmails: EmailPreviewData[];
  dailyLimitRemaining: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const invalidDueEmails = dueEmails.filter((item) => !item.subject.trim() || !item.body.trim() || findUnresolvedPlaceholders(`${item.subject}\n${item.body}`).length > 0);

  async function run() {
    setConfirmOpen(false);
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/automation/run", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Automation failed.");
      setMessage(`Sent ${data.sent}, skipped ${data.skipped}, failed ${data.failed}. Remaining today: ${data.dailyLimitRemaining}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Automation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button className="btn-primary w-fit" type="button" onClick={() => setConfirmOpen(true)} disabled={loading || dueCount <= 0}>
        <Play className="h-4 w-4" />
        {loading ? "Running..." : "Run Automation Now"}
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      {confirmOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-soft">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 className="text-lg font-semibold">Confirm automation run</h2>
                <p className="text-sm text-muted">Review what is due before sending.</p>
              </div>
              <button className="btn-secondary px-3" type="button" onClick={() => setConfirmOpen(false)} aria-label="Close automation confirmation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid gap-3 text-sm md:grid-cols-3">
                <p><span className="field-label">Due emails</span><br />{dueCount}</p>
                <p><span className="field-label">Daily limit remaining</span><br />{dailyLimitRemaining}</p>
                <p><span className="field-label">Campaigns</span><br />{Array.from(new Set(dueEmails.map((item) => item.campaignName))).join(", ") || "None"}</p>
              </div>
              <div className="mt-5">
                {invalidDueEmails.length ? (
                  <div className="mb-4 rounded-md border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-ink">
                    <p className="font-semibold">Automation blocked until email content is fixed.</p>
                    <p className="mt-1 text-muted">
                      Missing subject/body or unresolved placeholders: {invalidDueEmails.map((item) => item.leadName).join(", ")}
                    </p>
                  </div>
                ) : null}
                <p className="field-label">First 5 recipients</p>
                <div className="mt-2 grid gap-2">
                  {dueEmails.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 rounded-md border border-line p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{item.leadName}</p>
                        <p className="text-xs text-muted">{item.recipientEmail} / {item.campaignName} / {item.step}</p>
                      </div>
                      <EmailPreviewModal email={item} label="Preview Email" />
                    </div>
                  ))}
                  {!dueEmails.length ? <p className="text-sm text-muted">No due emails are available to send.</p> : null}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="btn-primary" type="button" onClick={run} disabled={loading || dueEmails.length <= 0 || invalidDueEmails.length > 0}>
                  {loading ? "Running..." : "Send due emails"}
                </button>
                <button className="btn-secondary" type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
