const messages: Record<string, string> = {
  "lead-added": "Lead added.",
  "csv-uploaded": "CSV uploaded.",
  "email-generated": "Email generated and added to review.",
  "template-fallback-used": "Generated using template fallback.",
  "generate-error": "Could not generate this email. Please check the lead and database setup.",
  "generate-validation-error": "Business name, email, and service to pitch are required before generation.",
  "bulk-generated": "Generated review emails for new leads.",
  "bulk-generate-error": "Could not bulk generate emails. Please check the database setup.",
  "already-generated": "This lead already has a generated email. Use regenerate if you want to replace it.",
  "email-regenerated": "Email regenerated.",
  "template-regenerated": "Template email regenerated.",
  "ai-regenerated": "AI email regenerated.",
  "gmail-draft-created": "Gmail draft created.",
  "email-approved": "Email approved and queued.",
  "emails-approved": "Selected emails approved and queued.",
  "campaign-created": "Campaign created.",
  "campaign-updated": "Campaign updated.",
  "campaign-emails-generated": "Campaign emails generated.",
  "leads-assigned": "Leads assigned to campaign.",
  "leads-removed": "Leads removed from campaign.",
  "campaign-csv-uploaded": "CSV leads uploaded to campaign.",
  "automation-run": "Automation run completed.",
  "daily-report": "Daily report generated.",
  "lead-status-updated": "Lead status updated and future follow-ups cancelled.",
  "email-sent": "Approved email sent through Resend.",
  "audit-generated": "Website audit angle generated.",
  "audit-error": "Could not generate the audit angle. Template fallback will still work for email generation.",
  "audit-validation-error": "Business name, email, and service to pitch are required before generating an audit angle.",
  "marked-sent": "Lead marked as sent and follow-up reminder created.",
  "lead-skipped": "Lead skipped.",
  "settings-saved": "Settings saved."
};

export function ToastBanner({
  toast,
  count,
  alreadyGenerated,
  skipped,
  alreadyQueued
}: {
  toast?: string;
  count?: string;
  alreadyGenerated?: string;
  skipped?: string;
  alreadyQueued?: string;
}) {
  if (!toast) return null;

  const message = messages[toast] || "Done.";
  const suffix = count && ["csv-uploaded", "emails-approved", "campaign-emails-generated", "campaign-csv-uploaded", "leads-removed"].includes(toast) ? ` ${count} item${count === "1" ? "" : "s"} processed.` : "";
  const details = [
    alreadyGenerated ? `${alreadyGenerated} already generated` : "",
    alreadyQueued ? `${alreadyQueued} already queued` : "",
    skipped ? `${skipped} skipped` : ""
  ].filter(Boolean);

  return (
    <div className="mb-5 rounded-md border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-medium text-ink">
      {message}
      {suffix}
      {details.length ? <span className="ml-1 text-muted">{details.join(". ")}.</span> : null}
    </div>
  );
}
