import { DailyReportButton } from "@/components/daily-report-button";
import { EmailPreviewModal } from "@/components/email-preview-modal";
import { getReportStats, isDatabaseReady, listSentEmailPreviews } from "@/lib/db";
import { SetupWarning } from "@/components/setup-warning";

function pct(value: number) {
  return `${value}%`;
}

export default async function ReportsPage() {
  const [databaseReady, stats, sentEmailPreviews] = await Promise.all([isDatabaseReady(), getReportStats(), listSentEmailPreviews()]);
  const sentTodayInitial = stats.sentToday.filter((item) => (item.step || "initial") === "initial").length;
  const sentTodayFollowups = stats.sentToday.length - sentTodayInitial;
  const campaignRows = stats.campaigns.map((campaign) => {
    const leads = stats.leads.filter((lead) => lead.campaign_id === campaign.id);
    const sent = stats.sent.filter((item) => item.campaign_id === campaign.id);
    const replies = leads.filter((lead) => lead.sequence_status === "replied" || lead.status === "Replied").length;
    const interested = leads.filter((lead) => lead.sequence_status === "interested").length;
    const conversions = leads.filter((lead) => lead.sequence_status === "converted" || lead.status === "Converted").length;
    return {
      campaign,
      leads: leads.length,
      sent: sent.length,
      replies,
      interested,
      conversions,
      replyRate: sent.length ? Math.round((replies / sent.length) * 100) : 0,
      lastActivity: stats.recentActivity.find((item) => item.campaign_id === campaign.id)?.created_at || campaign.updated_at
    };
  });
  const bestCampaign = [...campaignRows].sort((a, b) => b.replyRate - a.replyRate)[0]?.campaign.name || "Not enough data yet";
  const needsAttention = campaignRows.find((row) => row.sent > 0 && row.replyRate === 0)?.campaign.name || "No clear issue yet";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toDateString();
  const scheduledTomorrow = stats.queueItems.filter((item) => item.status === "queued" && new Date(item.scheduled_at).toDateString() === tomorrowDate).length;
  const followupsDueTomorrow = stats.queueItems.filter((item) => item.status === "queued" && item.step !== "initial" && new Date(item.scheduled_at).toDateString() === tomorrowDate).length;

  const cards = [
    ["Sent today", stats.sentToday.length],
    ["Sent this week", stats.sentThisWeek.length],
    ["Total sent", stats.totalSent],
    ["Generated emails", stats.generated],
    ["Pending review", stats.pendingReview],
    ["Scheduled emails", stats.scheduled],
    ["Follow-ups due today", stats.followupsDueToday],
    ["Replies", stats.replies],
    ["Interested", stats.interested],
    ["Not interested", stats.notInterested],
    ["Converted", stats.converted],
    ["Failed sends", stats.failed],
    ["Reply rate", pct(stats.replyRate)],
    ["Interested rate", pct(stats.interestedRate)],
    ["Conversion rate", pct(stats.conversionRate)]
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted">Track sending volume, replies, outcomes, and campaign performance.</p>
      </div>
      <SetupWarning ready={databaseReady} />
      <div className="grid gap-4 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="panel p-4">
            <p className="field-label">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <DailyReportButton
          report={{
            date: new Date().toLocaleDateString(),
            initialSent: sentTodayInitial,
            followupsSent: sentTodayFollowups,
            totalSent: stats.sentToday.length,
            replies: stats.replies,
            interested: stats.interested,
            notInterested: stats.notInterested,
            converted: stats.converted,
            failed: stats.failed,
            pendingReview: stats.pendingReview,
            scheduledTomorrow,
            followupsDueTomorrow,
            bestCampaign,
            needsAttention
          }}
        />
      </div>
      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-line p-5">
          <h2 className="text-lg font-semibold">Campaign performance</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cloud text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Replies</th>
              <th className="px-4 py-3">Interested</th>
              <th className="px-4 py-3">Conversions</th>
              <th className="px-4 py-3">Reply rate</th>
              <th className="px-4 py-3">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {campaignRows.map((row) => (
              <tr key={row.campaign.id} className="border-t border-line">
                <td className="px-4 py-3">{row.campaign.name}</td>
                <td className="px-4 py-3">{row.leads}</td>
                <td className="px-4 py-3">{row.sent}</td>
                <td className="px-4 py-3">{row.replies}</td>
                <td className="px-4 py-3">{row.interested}</td>
                <td className="px-4 py-3">{row.conversions}</td>
                <td className="px-4 py-3">{pct(row.replyRate)}</td>
                <td className="px-4 py-3">{new Date(row.lastActivity).toLocaleString()}</td>
              </tr>
            ))}
            {!campaignRows.length ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">No campaign data yet.</td></tr> : null}
          </tbody>
        </table>
      </section>
      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold">Daily activity</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-5">
          <p><span className="field-label">Date</span><br />{new Date().toLocaleDateString()}</p>
          <p><span className="field-label">Initial emails sent</span><br />{sentTodayInitial}</p>
          <p><span className="field-label">Follow-ups sent</span><br />{sentTodayFollowups}</p>
          <p><span className="field-label">Replies</span><br />{stats.replies}</p>
          <p><span className="field-label">Failed</span><br />{stats.failed}</p>
        </div>
      </section>
      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-line p-5">
          <h2 className="text-lg font-semibold">Sent Emails</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-cloud text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date sent</th>
              <th className="px-4 py-3">Lead/business</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Provider message id</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sentEmailPreviews.map((item) => (
              <tr key={item.id} className="border-t border-line align-top">
                <td className="px-4 py-3">{item.sentAt ? new Date(item.sentAt).toLocaleString() : "Unknown"}</td>
                <td className="px-4 py-3">{item.leadName}</td>
                <td className="px-4 py-3">{item.recipientEmail}</td>
                <td className="px-4 py-3">{item.campaignName}</td>
                <td className="px-4 py-3">{item.step}</td>
                <td className="px-4 py-3">{item.subject}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{item.providerMessageId || "None"}</td>
                <td className="px-4 py-3">
                  <EmailPreviewModal email={item} label="View Sent Email" />
                </td>
              </tr>
            ))}
            {!sentEmailPreviews.length ? <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">No sent emails yet.</td></tr> : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
