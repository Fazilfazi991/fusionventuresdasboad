"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function SendApprovedEmailButton({
  generatedEmailId,
  leadId,
  leadEmail
}: {
  generatedEmailId: string;
  leadId: string;
  leadEmail: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendEmail() {
    const form = document.getElementById(`review-form-${generatedEmailId}`) as HTMLFormElement | null;
    if (!form) return;

    const formData = new FormData(form);
    const subject = String(formData.get("subject") || "");
    const body = String(formData.get("body") || "");

    if (/\{\{[^}]+\}\}/.test(`${subject}\n${body}`)) {
      setMessage("This email still contains unresolved placeholders. Please fix them before sending.");
      setConfirming(false);
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/send-approved-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          leadId,
          generatedEmailId,
          subject,
          body
        })
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Failed to send approved email.");
      }

      setMessage("Email sent through Resend.");
      setConfirming(false);
      window.location.href = "/dashboard/email/review?toast=email-sent";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send approved email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button className="btn-primary" type="button" onClick={() => setConfirming(true)} disabled={sending}>
        <Send className="h-4 w-4" />
        {sending ? "Sending..." : "Send Approved Email"}
      </button>
      {message ? <p className="w-full text-sm font-medium text-rose">{message}</p> : null}
      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold">Confirm Send</h3>
            <p className="mt-2 text-sm text-muted">Send this email to {leadEmail}?</p>
            <p className="mt-3 text-sm text-muted">This will send through Resend immediately and mark the lead as Sent.</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setConfirming(false)} disabled={sending}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={sendEmail} disabled={sending}>
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send now"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
