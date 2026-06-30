import { ToastBanner } from "@/components/toast-banner";
import { SetupWarning } from "@/components/setup-warning";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { cancelQueuedEmail, markLeadClosed, markLeadReplied } from "@/app/dashboard/email/email-actions";
import { isDatabaseReady, listQueueEmailPreviews, listQueueItems } from "@/lib/db";

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<{ toast?: string }> }) {
  const params = await searchParams;
  const [databaseReady, queueItems, queuePreviews] = await Promise.all([isDatabaseReady(), listQueueItems(), listQueueEmailPreviews()]);
  const previewById = new Map(queuePreviews.map((item) => [item.id, item]));
  const followups = queueItems.filter((item) => item.step !== "initial" && ["queued", "failed"].includes(item.status));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Follow-up Reminders</h1>
        <p className="text-sm text-muted">Queued follow-ups appear here and stop automatically when you mark a lead replied or closed.</p>
      </div>
      <SetupWarning ready={databaseReady} />
      <ToastBanner toast={params.toast} />
      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cloud text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((item) => {
              const preview = previewById.get(item.id) || null;
              return (
              <tr key={item.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.leads?.business_name || item.to_email}</p>
                  <p className="text-xs text-muted">{item.to_email}</p>
                </td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{new Date(item.scheduled_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">{item.step}</td>
                <td className="px-4 py-3">
                  <div className="grid gap-2">
                    <EmailPreviewModal email={preview} label="View Follow-up Email" />
                    {item.status === "queued" ? (
                      <>
                        <EmailPreviewModal email={preview} label="Edit Follow-up Email" />
                        <form action={cancelQueuedEmail}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="btn-danger text-xs" type="submit">Cancel Follow-up</button>
                        </form>
                      </>
                    ) : null}
                    <form action={markLeadReplied}>
                      <input type="hidden" name="leadId" value={item.lead_id} />
                      <input type="hidden" name="campaignId" value={item.campaign_id || ""} />
                      <button className="btn-secondary text-xs" type="submit">Mark lead replied</button>
                    </form>
                    <form action={markLeadClosed}>
                      <input type="hidden" name="leadId" value={item.lead_id} />
                      <input type="hidden" name="campaignId" value={item.campaign_id || ""} />
                      <button className="btn-secondary text-xs" type="submit">Mark lead closed</button>
                    </form>
                  </div>
                </td>
              </tr>
              );
            })}
            {!followups.length ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                  No follow-ups due yet. They will appear after initial emails are sent from the queue.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
