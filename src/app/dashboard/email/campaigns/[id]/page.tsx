import { Sparkles } from "lucide-react";
import { CampaignAssignedLeadsTable } from "@/components/campaign-assigned-leads-table";
import { CampaignLeadAssignment } from "@/components/campaign-lead-assignment";
import { SetupWarning } from "@/components/setup-warning";
import { ToastBanner } from "@/components/toast-banner";
import {
  approveGeneratedEmailsForSelectedLeads,
  assignMatchingLeadsToCampaign,
  assignSelectedLeadsToCampaign,
  generateEmailsForCampaign,
  generateEmailsForSelectedCampaignLeads,
  markSelectedLeadsClosed,
  regenerateEmailForCampaignLead,
  removeSelectedLeadsFromCampaign,
  updateCampaignLeadStatus,
  uploadLeadsToCampaign
} from "@/app/dashboard/email/campaigns/actions";
import { generatedPreview, getCampaign, isDatabaseReady, listCampaignLeads, listLeads, listQueueEmailPreviews, listQueueItems, listRecentActivity, listReviewItems, listSentEmailPreviews } from "@/lib/db";
import type { EmailPreviewData } from "@/lib/types";

export default async function CampaignDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ toast?: string; count?: string; assigned?: string; skipped?: string; alreadyGenerated?: string; alreadyQueued?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [databaseReady, campaign, campaignLeads, allLeads, queueItems, reviewItems, queuePreviews, sentPreviews, activity] = await Promise.all([
    isDatabaseReady(),
    getCampaign(id),
    listCampaignLeads(id),
    listLeads(),
    listQueueItems(),
    listReviewItems(),
    listQueueEmailPreviews(),
    listSentEmailPreviews(),
    listRecentActivity(50)
  ]);

  if (!campaign) {
    return <div className="panel p-8 text-sm text-muted">Campaign not found.</div>;
  }

  const campaignQueue = queueItems.filter((item) => item.campaign_id === id);
  const generatedLeadIds = new Set(
    reviewItems
      .filter((item) => item.status !== "archived" && (item.campaign_id === id || item.leads.campaign_id === id))
      .map((item) => item.lead_id)
  );
  const stats = [
    { label: "Total leads", value: campaignLeads.length },
    { label: "Generated", value: generatedLeadIds.size },
    { label: "Scheduled", value: campaignQueue.filter((item) => item.status === "queued").length },
    { label: "Sent", value: campaignQueue.filter((item) => item.status === "sent").length },
    { label: "Replied", value: campaignLeads.filter((lead) => lead.sequence_status === "replied" || lead.status === "Replied").length },
    { label: "Interested", value: campaignLeads.filter((lead) => lead.sequence_status === "interested").length },
    { label: "Not interested", value: campaignLeads.filter((lead) => lead.sequence_status === "not_interested" || lead.status === "Not Interested").length },
    { label: "Converted", value: campaignLeads.filter((lead) => lead.sequence_status === "converted" || lead.status === "Converted").length },
    { label: "Failed", value: campaignQueue.filter((item) => item.status === "failed").length },
    { label: "Follow-ups due", value: campaignQueue.filter((item) => item.status === "queued" && item.step !== "initial" && new Date(item.scheduled_at) <= new Date()).length }
  ];
  const emailPreviews: Record<string, { generated: EmailPreviewData | null; queued: EmailPreviewData | null; sent: EmailPreviewData | null }> = {};
  for (const lead of campaignLeads) emailPreviews[lead.id] = { generated: null, queued: null, sent: null };
  for (const item of reviewItems.filter((item) => item.campaign_id === id || item.leads.campaign_id === id)) {
    if (!emailPreviews[item.lead_id]?.generated) {
      emailPreviews[item.lead_id] = {
        ...(emailPreviews[item.lead_id] || { generated: null, queued: null, sent: null }),
        generated: generatedPreview(item, campaign.name)
      };
    }
  }
  for (const item of queuePreviews.filter((item) => item.campaignId === id)) {
    if (!emailPreviews[item.leadId]) continue;
    const current = emailPreviews[item.leadId].queued;
    if (!current || (item.status === "queued" && current.status !== "queued") || new Date(item.scheduledAt || "1970-01-01") > new Date(current.scheduledAt || "1970-01-01")) {
      emailPreviews[item.leadId].queued = item;
    }
  }
  for (const item of sentPreviews.filter((item) => item.campaignId === id)) {
    if (!emailPreviews[item.leadId]) continue;
    const current = emailPreviews[item.leadId].sent;
    if (!current || new Date(item.sentAt || "1970-01-01") > new Date(current.sentAt || "1970-01-01")) {
      emailPreviews[item.leadId].sent = item;
    }
  }
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{campaign.name}</h1>
          <p className="text-sm text-muted">{campaign.description || `${campaign.service_to_pitch} outreach campaign.`}</p>
        </div>
        <form action={generateEmailsForCampaign}>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <button className="btn-primary">
            <Sparkles className="h-4 w-4" />
            Generate Emails for Campaign
          </button>
        </form>
      </div>
      <SetupWarning ready={databaseReady} />
      <ToastBanner toast={query.toast} count={query.count} alreadyGenerated={query.alreadyGenerated} alreadyQueued={query.alreadyQueued} skipped={query.skipped} />
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-4">
            <p className="field-label">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <CampaignAssignedLeadsTable
          campaignId={campaign.id}
          leads={campaignLeads}
          emailPreviews={emailPreviews}
          generateSelectedAction={generateEmailsForSelectedCampaignLeads}
          regenerateAction={regenerateEmailForCampaignLead}
          approveSelectedAction={approveGeneratedEmailsForSelectedLeads}
          removeSelectedAction={removeSelectedLeadsFromCampaign}
          closeSelectedAction={markSelectedLeadsClosed}
          updateStatusAction={updateCampaignLeadStatus}
        />
      </div>
      <div className="mt-6">
        <CampaignLeadAssignment
          campaignId={campaign.id}
          leads={allLeads}
          assignSelectedAction={assignSelectedLeadsToCampaign}
          assignMatchingAction={assignMatchingLeadsToCampaign}
          uploadAction={uploadLeadsToCampaign}
          summary={{ assigned: query.assigned, skipped: query.skipped }}
        />
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold">Activity log</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          {activity.filter((item) => item.campaign_id === campaign.id).slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-md border border-line p-3">
              <p className="font-medium">{item.message}</p>
              <p className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</p>
            </div>
          ))}
          {!activity.filter((item) => item.campaign_id === campaign.id).length ? <p className="text-sm text-muted">No activity yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
