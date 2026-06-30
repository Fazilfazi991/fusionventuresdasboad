import { countSentToday, getCampaign, getSettings, logActivity } from "@/lib/db";
import { hasUnresolvedPlaceholders } from "@/lib/placeholders";
import { getDailySendLimit, getEmailSendingConfig, sendWithResend } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Campaign, EmailQueueItem, GeneratedEmail, Lead } from "@/lib/types";

const STOP_SEQUENCE_STATUSES = new Set(["replied", "interested", "not_interested", "converted", "unsubscribed", "closed"]);
const STOP_LEAD_STATUSES = new Set(["Replied", "Not Interested", "Converted", "Skipped"]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseHour(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour: Number.isFinite(hour) ? hour : 9, minute: Number.isFinite(minute) ? minute : 0 };
}

function isWithinWorkingWindow(campaign: Campaign | null, now = new Date()) {
  if (!campaign) return true;
  if (!campaign.send_weekends && [0, 6].includes(now.getDay())) return false;
  const start = parseHour(campaign.working_hours_start);
  const end = parseHour(campaign.working_hours_end);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function nextFollowupStep(step: EmailQueueItem["step"]) {
  if (step === "initial") return "followup1";
  if (step === "followup1") return "followup2";
  if (step === "followup2") return "followup3";
  return null;
}

function nextSequenceStatus(step: EmailQueueItem["step"]) {
  if (step === "initial") return "initial_sent";
  if (step === "followup1") return "followup1_sent";
  if (step === "followup2") return "followup2_sent";
  return "followup3_sent";
}

function dueStatusFor(step: NonNullable<ReturnType<typeof nextFollowupStep>>) {
  if (step === "followup1") return "followup1_due";
  if (step === "followup2") return "followup2_due";
  return "followup3_due";
}

function delayFor(campaign: Campaign | null, step: NonNullable<ReturnType<typeof nextFollowupStep>>) {
  if (step === "followup1") return campaign?.followup1_delay_days || 3;
  if (step === "followup2") return campaign?.followup2_delay_days || 7;
  return campaign?.followup3_delay_days || 12;
}

function contentForStep(generated: GeneratedEmail, step: EmailQueueItem["step"]) {
  if (step === "followup1") return { subject: generated.approved_subject || generated.subject, body: generated.follow_up_1 };
  if (step === "followup2") return { subject: generated.approved_subject || generated.subject, body: generated.follow_up_2 };
  if (step === "followup3") {
    return {
      subject: generated.approved_subject || generated.subject,
      body: generated.follow_up_3 || "Hi,\n\nJust closing the loop on this. If it becomes useful later, happy to share a few practical ideas.\n\nBest regards"
    };
  }
  return {
    subject: generated.approved_subject || generated.edited_subject || generated.subject,
    body: generated.approved_body || generated.edited_body || generated.body
  };
}

export async function queueApprovedEmail(generatedEmailId: string, scheduledAt = new Date().toISOString()) {
  const supabase = getSupabaseAdmin();
  const { data: generated, error: generatedError } = await supabase
    .from("generated_emails")
    .select("*, leads(*)")
    .eq("id", generatedEmailId)
    .maybeSingle();
  if (generatedError) throw generatedError;
  if (!generated) throw new Error("Generated email not found.");

  const lead = generated.leads as Lead;
  const subject = generated.approved_subject || generated.edited_subject || generated.subject;
  const body = generated.approved_body || generated.edited_body || generated.body;

  if (!lead.email || !isValidEmail(lead.email)) throw new Error("Lead recipient email is missing or invalid.");
  if (hasUnresolvedPlaceholders(`${subject}\n${body}`)) throw new Error("Email has unresolved placeholders.");

  let existingQueueQuery = supabase
    .from("email_queue")
    .select("id,status")
    .eq("lead_id", lead.id)
    .eq("step", "initial")
    .in("status", ["queued", "sending", "sent"])
    .limit(1);
  existingQueueQuery = lead.campaign_id ? existingQueueQuery.eq("campaign_id", lead.campaign_id) : existingQueueQuery.is("campaign_id", null);
  const { data: existingQueue, error: existingQueueError } = await existingQueueQuery.maybeSingle();
  if (existingQueueError) throw existingQueueError;
  if (existingQueue) {
    return { queued: 0, alreadyQueued: 1 };
  }

  const { error } = await supabase.from("email_queue").upsert(
    {
      lead_id: lead.id,
      campaign_id: lead.campaign_id,
      generated_email_id: generated.id,
      step: "initial",
      to_email: lead.email,
      subject,
      body,
      status: "queued",
      scheduled_at: scheduledAt,
      error_message: null
    },
    { onConflict: "lead_id,step" }
  );
  if (error) throw error;

  await supabase
    .from("leads")
    .update({ sequence_status: "scheduled", status: "Generated", next_action_at: scheduledAt })
    .eq("id", lead.id);
  await supabase.from("generated_emails").update({ status: "Approved" }).eq("id", generated.id);
  await logActivity({ leadId: lead.id, campaignId: lead.campaign_id, type: "email_queued", message: "Initial email queued for controlled sending." });
  return { queued: 1, alreadyQueued: 0 };
}

export async function cancelFutureFollowups(leadId: string, reason: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("email_queue")
    .update({ status: "cancelled", error_message: reason })
    .eq("lead_id", leadId)
    .eq("status", "queued")
    .neq("step", "initial");
}

async function scheduleNextFollowup(item: EmailQueueItem, generated: GeneratedEmail, campaign: Campaign | null) {
  const nextStep = nextFollowupStep(item.step);
  if (!nextStep) return;

  const content = contentForStep(generated, nextStep);
  const scheduledAt = addDays(delayFor(campaign, nextStep));
  const supabase = getSupabaseAdmin();

  await supabase.from("email_queue").upsert(
    {
      lead_id: item.lead_id,
      campaign_id: item.campaign_id,
      generated_email_id: item.generated_email_id,
      step: nextStep,
      to_email: item.to_email,
      subject: content.subject,
      body: content.body,
      status: "queued",
      scheduled_at: scheduledAt
    },
    { onConflict: "lead_id,step" }
  );
  await supabase.from("leads").update({ sequence_status: dueStatusFor(nextStep), next_action_at: scheduledAt }).eq("id", item.lead_id);
  await logActivity({ leadId: item.lead_id, campaignId: item.campaign_id, type: "followup_scheduled", message: `${nextStep} scheduled.` });
}

export async function runAutomation() {
  const supabase = getSupabaseAdmin();
  const settings = await getSettings();
  const globalLimit = getDailySendLimit(settings);
  let dailyLimitRemaining = Math.max(globalLimit - (await countSentToday()), 0);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  if (dailyLimitRemaining <= 0) {
    return { sent, skipped, failed, dailyLimitRemaining };
  }

  const { data: dueItems, error } = await supabase
    .from("email_queue")
    .select("*, leads(*), generated_emails(*)")
    .eq("status", "queued")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(dailyLimitRemaining);
  if (error) throw error;

  const invalidDueItems = (dueItems || []).filter((row) => {
    const item = row as EmailQueueItem & { leads: Lead };
    return !item.subject?.trim() || !item.body?.trim() || hasUnresolvedPlaceholders(`${item.subject}\n${item.body}`);
  });
  if (invalidDueItems.length) {
    const affected = invalidDueItems
      .slice(0, 8)
      .map((row) => {
        const item = row as EmailQueueItem & { leads: Lead };
        return item.leads?.business_name || item.to_email;
      })
      .join(", ");
    throw new Error(`Automation blocked. Missing subject/body or unresolved placeholders found for: ${affected}.`);
  }

  for (const row of dueItems || []) {
    const item = row as EmailQueueItem & { leads: Lead; generated_emails: GeneratedEmail };
    const lead = item.leads;
    const generated = item.generated_emails;
    const campaign = item.campaign_id ? await getCampaign(item.campaign_id) : null;

    const campaignSentToday = campaign
      ? await supabase
          .from("sent_emails")
          .select("id", { count: "exact", head: true })
          .eq("status", "sent")
          .eq("campaign_id", campaign.id)
          .gte("sent_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      : null;
    const campaignLimitHit = Boolean(campaign && (campaignSentToday?.count || 0) >= campaign.daily_send_limit);

    const shouldSkip =
      dailyLimitRemaining <= 0 ||
      campaignLimitHit ||
      !isWithinWorkingWindow(campaign) ||
      !isValidEmail(item.to_email) ||
      hasUnresolvedPlaceholders(`${item.subject}\n${item.body}`) ||
      STOP_LEAD_STATUSES.has(lead.status) ||
      STOP_SEQUENCE_STATUSES.has(lead.sequence_status || "");

    if (shouldSkip) {
      skipped += 1;
      await supabase.from("email_queue").update({ status: "skipped", error_message: "Skipped by safety rules." }).eq("id", item.id);
      await logActivity({ leadId: item.lead_id, campaignId: item.campaign_id, type: "email_skipped", message: "Queued email skipped by automation safety rules." });
      continue;
    }

    await supabase.from("email_queue").update({ status: "sending" }).eq("id", item.id);
    try {
      const response = await sendWithResend({ to: item.to_email, subject: item.subject, body: item.body, settings });
      const sentAt = new Date().toISOString();
      const config = getEmailSendingConfig(settings);

      await supabase.from("email_queue").update({ status: "sent", sent_at: sentAt, provider: "resend", provider_message_id: response.id }).eq("id", item.id);
      await supabase.from("sent_emails").upsert(
        {
          lead_id: item.lead_id,
          campaign_id: item.campaign_id,
          generated_email_id: item.generated_email_id,
          provider: "resend",
          step: item.step,
          provider_message_id: response.id,
          to_email: item.to_email,
          from_email: config.from,
          subject: item.subject,
          body: item.body,
          status: "sent",
          sent_at: sentAt
        },
        { onConflict: "generated_email_id,step" }
      );
      await supabase
        .from("leads")
        .update({ status: "Sent", sequence_status: nextSequenceStatus(item.step), current_step: item.step, last_sent_at: sentAt, last_contacted_at: sentAt })
        .eq("id", item.lead_id);
      await logActivity({ leadId: item.lead_id, campaignId: item.campaign_id, type: item.step === "initial" ? "email_sent" : "followup_sent", message: `${item.step} sent via Resend.` });
      await scheduleNextFollowup(item, generated, campaign);
      sent += 1;
      dailyLimitRemaining -= 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Resend send failed.";
      await supabase.from("email_queue").update({ status: "failed", error_message: message }).eq("id", item.id);
      await supabase.from("leads").update({ sequence_status: "failed" }).eq("id", item.lead_id);
      await logActivity({ leadId: item.lead_id, campaignId: item.campaign_id, type: "send_failed", message });
    }
  }

  await logActivity({
    type: "automation_run_completed",
    message: `Automation run completed. Sent ${sent}, skipped ${skipped}, failed ${failed}.`,
    metadata: { sent, skipped, failed, dailyLimitRemaining }
  });

  return { sent, skipped, failed, dailyLimitRemaining };
}
