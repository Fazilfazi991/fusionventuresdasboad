import { EmailEditor } from "@/components/email-editor";
import { SetupWarning } from "@/components/setup-warning";
import { ToastBanner } from "@/components/toast-banner";
import { generatedPreview, getSettings, isDatabaseReady, listCampaigns, listReviewItems } from "@/lib/db";
import { approveSelected } from "@/app/dashboard/email/review/actions";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ toast?: string; count?: string; alreadyQueued?: string }> }) {
  const params = await searchParams;
  const [databaseReady, reviewItems, settings, campaigns] = await Promise.all([isDatabaseReady(), listReviewItems(), getSettings(), listCampaigns()]);
  const campaignNames = new Map(campaigns.map((campaign) => [campaign.id, campaign.name]));
  const aiAvailable = Boolean(process.env.GEMINI_API_KEY);
  const latestByLeadCampaign = new Map<string, (typeof reviewItems)[number]>();
  for (const item of reviewItems) {
    const key = `${item.lead_id}:${item.campaign_id || item.leads.campaign_id || "none"}`;
    const current = latestByLeadCampaign.get(key);
    if (!current || new Date(item.created_at) > new Date(current.created_at)) {
      latestByLeadCampaign.set(key, item);
    }
  }
  const items = Array.from(latestByLeadCampaign.values()).filter((item) => !["Draft Created", "Sent", "Skipped", "Converted"].includes(item.leads.status));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Email Review Queue</h1>
        <p className="text-sm text-muted">Edit AI output, regenerate it, then approve emails into the controlled sending queue.</p>
      </div>
      <SetupWarning ready={databaseReady} />
      <ToastBanner toast={params.toast} count={params.count} alreadyQueued={params.alreadyQueued} />
      {items.length ? (
        <div className="panel mb-5 p-5">
          <h2 className="text-sm font-semibold">Bulk approval</h2>
          <p className="mt-1 text-sm text-muted">Approval only queues emails. It never sends immediately.</p>
          <form action={approveSelected} className="mt-4 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              {items.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                  <input type="checkbox" name="generatedIds" value={item.id} />
                  <span>{item.leads.business_name}</span>
                </label>
              ))}
            </div>
            <button className="btn-secondary w-fit" type="submit">Approve selected emails</button>
          </form>
          <form action={approveSelected} className="mt-3">
            {items.map((item) => (
              <input key={item.id} type="hidden" name="generatedIds" value={item.id} />
            ))}
            <button className="btn-secondary" type="submit">Approve all visible emails</button>
          </form>
        </div>
      ) : null}
      <div className="grid gap-5">
        {items.map((item) => (
          <EmailEditor
            key={item.id}
            item={item}
            settings={settings}
            aiAvailable={aiAvailable}
            preview={generatedPreview(item, item.campaign_id ? campaignNames.get(item.campaign_id) || "No campaign" : "No campaign")}
          />
        ))}
        {!items.length ? <div className="panel p-8 text-center text-sm text-muted">No generated emails waiting for review. Generate an email from the Leads page to start.</div> : null}
      </div>
    </div>
  );
}
