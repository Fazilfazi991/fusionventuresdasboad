"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

type DailyReport = {
  date: string;
  initialSent: number;
  followupsSent: number;
  totalSent: number;
  replies: number;
  interested: number;
  notInterested: number;
  converted: number;
  failed: number;
  pendingReview: number;
  scheduledTomorrow: number;
  followupsDueTomorrow: number;
  bestCampaign: string;
  needsAttention: string;
};

export function DailyReportButton({ report }: { report: DailyReport }) {
  const [text, setText] = useState("");

  function generate() {
    setText(`Daily Outreach Report
Date: ${report.date}

Sent today:
- Initial emails: ${report.initialSent}
- Follow-ups: ${report.followupsSent}
- Total: ${report.totalSent}

Results:
- Replies: ${report.replies}
- Interested: ${report.interested}
- Not interested: ${report.notInterested}
- Converted: ${report.converted}
- Failed sends: ${report.failed}

Pipeline:
- Pending review: ${report.pendingReview}
- Scheduled tomorrow: ${report.scheduledTomorrow}
- Follow-ups due tomorrow: ${report.followupsDueTomorrow}

Campaign highlights:
- Best campaign: ${report.bestCampaign}
- Needs attention: ${report.needsAttention}

Next actions:
- Review pending replies
- Approve review queue
- Check failed emails`);
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Daily report</h2>
          <p className="text-sm text-muted">Generate a copy-ready text summary for today.</p>
        </div>
        <button className="btn-secondary w-fit" type="button" onClick={generate}>
          <FileText className="h-4 w-4" />
          Generate Daily Report
        </button>
      </div>
      {text ? <textarea className="mt-4 min-h-80 w-full text-sm" readOnly value={text} /> : null}
    </div>
  );
}
