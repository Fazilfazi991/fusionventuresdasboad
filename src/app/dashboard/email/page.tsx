import { SetupWarning } from "@/components/setup-warning";
import { countSentToday, getReportStats, getSettings, isDatabaseReady } from "@/lib/db";
import { getDailySendLimit } from "@/lib/resend";

export default async function DashboardPage() {
  const [databaseReady, report, sentToday, settings] = await Promise.all([isDatabaseReady(), getReportStats(), countSentToday(), getSettings()]);
  const dailySendLimit = getDailySendLimit(settings);
  const stats = [
    { label: "Total leads", value: report.leads.length },
    { label: "Need review", value: report.pendingReview },
    { label: "Scheduled", value: report.scheduled },
    { label: "Sent today", value: `${sentToday}/${dailySendLimit}` },
    { label: "Follow-ups due", value: report.followupsDueToday },
    { label: "Replies", value: report.replies },
    { label: "Interested", value: report.interested },
    { label: "Converted", value: report.converted },
    { label: "Failed", value: report.failed }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">Your private lead generation and approved email sending workflow.</p>
      </div>
      <SetupWarning ready={databaseReady} />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="panel p-5">
            <p className="field-label">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Today's sending plan</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <p><span className="field-label">Due now</span><br />{report.queueItems.filter((item) => item.status === "queued" && new Date(item.scheduled_at) <= new Date()).length} queued emails</p>
            <p><span className="field-label">Daily limit remaining</span><br />{Math.max(dailySendLimit - sentToday, 0)}</p>
            <p><span className="field-label">Manual approval required</span><br />{settings?.require_manual_approval_before_first_send === false ? "No" : "Yes"}</p>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Automation status</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p>Queued emails are sent only by the manual runner or a future cron call.</p>
            <p>Follow-ups stop when a lead is replied, interested, not interested, converted, unsubscribed, or closed.</p>
            <p>Unresolved placeholders and duplicate sends are blocked before sending.</p>
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {report.recentActivity.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{item.message}</p>
                <p className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))}
            {!report.recentActivity.length ? <p className="text-sm text-muted">No activity yet.</p> : null}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Campaign performance preview</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {report.campaigns.slice(0, 5).map((campaign) => {
              const campaignLeads = report.leads.filter((lead) => lead.campaign_id === campaign.id);
              const campaignSent = report.sent.filter((item) => item.campaign_id === campaign.id);
              return (
                <div key={campaign.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-xs text-muted">{campaignLeads.length} leads - {campaignSent.length} sent - {campaign.status}</p>
                </div>
              );
            })}
            {!report.campaigns.length ? <p className="text-sm text-muted">Create a campaign to see performance.</p> : null}
          </div>
        </section>
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold">Guardrails</h2>
        <div className="mt-3 grid gap-3 text-sm text-muted md:grid-cols-3">
          <p>No emails are sent immediately after importing leads or generating AI output.</p>
          <p>Every email must be manually reviewed and approved.</p>
          <p>Daily send limit is enforced before sending.</p>
        </div>
      </section>
    </div>
  );
}
