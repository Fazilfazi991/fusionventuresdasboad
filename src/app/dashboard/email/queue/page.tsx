import { RunAutomationButton } from "@/components/run-automation-button";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { SetupWarning } from "@/components/setup-warning";
import { cancelQueuedEmail } from "@/app/dashboard/email/email-actions";
import { getAutomationPreview, isDatabaseReady, listQueueEmailPreviews, listQueueItems } from "@/lib/db";

export default async function QueuePage() {
  const [databaseReady, queueItems, queuePreviews, automationPreview] = await Promise.all([
    isDatabaseReady(),
    listQueueItems(),
    listQueueEmailPreviews(),
    getAutomationPreview()
  ]);
  const previewById = new Map(queuePreviews.map((item) => [item.id, item]));
  const dueCount = queuePreviews.filter((item) => item.status === "queued" && item.scheduledAt && new Date(item.scheduledAt) <= new Date()).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sending Queue</h1>
          <p className="text-sm text-muted">Approved emails wait here until the guarded automation runner sends them inside limits.</p>
        </div>
        <RunAutomationButton dueCount={dueCount} dueEmails={automationPreview.dueEmails} dailyLimitRemaining={automationPreview.dailyLimitRemaining} />
      </div>
      <SetupWarning ready={databaseReady} />
      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cloud text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queueItems.map((item) => {
              const preview = previewById.get(item.id) || null;
              return (
              <tr key={item.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.leads?.business_name || item.to_email}</p>
                  <p className="text-xs text-muted">{item.to_email}</p>
                </td>
                <td className="px-4 py-3">{item.campaigns?.name || "No campaign"}</td>
                <td className="px-4 py-3">{item.step}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-cloud px-2 py-1 text-xs font-semibold text-muted">{item.status}</span>
                  {item.error_message ? <p className="mt-1 text-xs text-rose">{item.error_message}</p> : null}
                </td>
                <td className="px-4 py-3">{new Date(item.scheduled_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    <EmailPreviewModal email={preview} label={item.status === "sent" ? "View Sent Email" : item.status === "failed" ? "View Error" : "View Queued Email"} />
                    {item.status === "queued" ? (
                      <>
                        <EmailPreviewModal email={preview} label="Edit Queued Email" />
                        <form action={cancelQueuedEmail}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="btn-danger text-xs" type="submit">Cancel queued email</button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
              );
            })}
            {!queueItems.length ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">No queued emails yet. Approve emails from the Review page to schedule them.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
