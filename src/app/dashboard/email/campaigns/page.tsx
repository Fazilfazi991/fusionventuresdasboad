import Link from "next/link";
import { Plus } from "lucide-react";
import { SetupWarning } from "@/components/setup-warning";
import { ToastBanner } from "@/components/toast-banner";
import { isDatabaseReady, listCampaigns, listLeads } from "@/lib/db";

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ toast?: string }> }) {
  const params = await searchParams;
  const [databaseReady, campaigns, leads] = await Promise.all([isDatabaseReady(), listCampaigns(), listLeads()]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted">Group leads by outreach goal and control generation, review, queueing, and follow-ups.</p>
        </div>
        <Link href="/dashboard/email/campaigns/new" className="btn-primary w-fit">
          <Plus className="h-4 w-4" />
          New campaign
        </Link>
      </div>
      <SetupWarning ready={databaseReady} />
      <ToastBanner toast={params.toast} />
      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const campaignLeads = leads.filter((lead) => lead.campaign_id === campaign.id);
          return (
            <Link key={campaign.id} href={`/dashboard/email/campaigns/${campaign.id}`} className="panel block p-5 transition hover:border-brand">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{campaign.name}</h2>
                  <p className="mt-1 text-sm text-muted">{campaign.service_to_pitch} {campaign.target_industry ? `for ${campaign.target_industry}` : ""}</p>
                </div>
                <span className="w-fit rounded-md bg-cloud px-2 py-1 text-xs font-semibold text-muted">{campaign.status}</span>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <p><span className="field-label">Leads</span><br />{campaignLeads.length}</p>
                <p><span className="field-label">Daily limit</span><br />{campaign.daily_send_limit}</p>
                <p><span className="field-label">Working hours</span><br />{campaign.working_hours_start}-{campaign.working_hours_end}</p>
                <p><span className="field-label">Weekends</span><br />{campaign.send_weekends ? "Allowed" : "Skipped"}</p>
              </div>
            </Link>
          );
        })}
        {!campaigns.length ? <div className="panel p-8 text-center text-sm text-muted">No campaigns yet. Create one, assign a few test leads, then generate emails safely.</div> : null}
      </div>
    </div>
  );
}
