import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { ActivityLog, AgencySettings, Campaign, EmailPreviewData, EmailQueueItem, GeneratedEmail, Lead, SentEmail } from "@/lib/types";

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

function isMissingSchemaError(error: SupabaseLikeError) {
  return error.code === "42P01" || error.message?.toLowerCase().includes("does not exist");
}

function throwReadableError(error: SupabaseLikeError): never {
  throw new Error(error.message || JSON.stringify(error));
}

export async function isDatabaseReady() {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").select("id", { head: true, count: "exact" }).limit(1);
    if (!error) return true;
    if (isMissingSchemaError(error)) return false;
    throwReadableError(error);
  } catch (error) {
    if (error instanceof Error && error.message.includes("environment variables are missing")) {
      return false;
    }
    throw error;
  }
}

export async function getSettings(): Promise<AgencySettings | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("agency_settings").select("*").limit(1).maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return null;
    throwReadableError(error);
  }
  return data;
}

export async function upsertSettings(input: Partial<AgencySettings>) {
  const supabase = getSupabaseAdmin();
  const current = await getSettings();
  const payload = {
    sender_name: input.sender_name || "Fazil",
    agency_name: input.agency_name || "Fusion Ventures",
    portfolio_url: input.portfolio_url || "https://www.fusionventuresglobal.com/web-portfolio",
    reply_to_email: input.reply_to_email || "",
    sender_email: input.sender_email || "",
    default_signature: input.default_signature || "",
    daily_draft_limit: Number(input.daily_draft_limit || 25),
    daily_send_limit: Number(input.daily_send_limit || 25),
    generation_mode: input.generation_mode || "template",
    openai_api_key_encrypted: input.openai_api_key_encrypted || null,
    gmail_connected: Boolean(input.gmail_connected),
    bulk_unsubscribe_line: input.bulk_unsubscribe_line || "If this is not relevant, reply unsubscribe and I will not contact you again."
    ,
    require_manual_approval_before_first_send: input.require_manual_approval_before_first_send ?? true,
    default_working_hours_start: input.default_working_hours_start || "09:00",
    default_working_hours_end: input.default_working_hours_end || "17:00",
    send_weekends: input.send_weekends ?? false,
    followup1_delay_days: Number(input.followup1_delay_days || 3),
    followup2_delay_days: Number(input.followup2_delay_days || 7),
    followup3_delay_days: Number(input.followup3_delay_days || 12)
  };

  if (current) {
    const { error } = await supabase.from("agency_settings").update(payload).eq("id", current.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("agency_settings").insert(payload);
  if (error) throw error;
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return data || [];
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return null;
    throwReadableError(error);
  }
  return data;
}

export async function listReviewItems(): Promise<Array<GeneratedEmail & { leads: Lead }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("generated_emails")
    .select("*, leads(*)")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return ((data || []) as Array<GeneratedEmail & { leads: Lead }>).filter((item) => item.status !== "archived");
}

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return data || [];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return null;
    throwReadableError(error);
  }
  return data;
}

export async function listCampaignLeads(campaignId: string): Promise<Lead[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return data || [];
}

export async function listQueueItems(): Promise<Array<EmailQueueItem & { leads: Lead | null; campaigns: Campaign | null }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_queue")
    .select("*, leads(*), campaigns(*)")
    .order("scheduled_at", { ascending: true });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return (data || []) as Array<EmailQueueItem & { leads: Lead | null; campaigns: Campaign | null }>;
}

export async function listSentEmails(): Promise<Array<SentEmail & { leads: Lead | null; campaigns: Campaign | null; generated_emails: GeneratedEmail | null }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sent_emails")
    .select("*, leads(*), campaigns(*), generated_emails(*)")
    .order("sent_at", { ascending: false, nullsFirst: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return (data || []) as Array<SentEmail & { leads: Lead | null; campaigns: Campaign | null; generated_emails: GeneratedEmail | null }>;
}

export function generatedPreview(item: GeneratedEmail & { leads: Lead }, campaignName = "No campaign"): EmailPreviewData {
  return {
    source: "generated",
    id: item.id,
    generatedEmailId: item.id,
    leadId: item.lead_id,
    campaignId: item.campaign_id,
    leadName: item.leads.business_name,
    recipientEmail: item.leads.email,
    campaignName,
    step: "initial",
    generationProvider: item.model,
    subject: item.edited_subject || item.approved_subject || item.subject,
    body: item.edited_body || item.approved_body || item.body,
    followUp1: item.follow_up_1,
    followUp2: item.follow_up_2,
    followUp3: item.follow_up_3,
    status: item.status,
    scheduledAt: null,
    sentAt: null,
    providerMessageId: null,
    errorMessage: null
  };
}

export function queuePreview(item: EmailQueueItem & { leads: Lead | null; campaigns: Campaign | null; generated_emails?: GeneratedEmail | null }): EmailPreviewData {
  const generated = item.generated_emails || null;
  return {
    source: "queue",
    id: item.id,
    generatedEmailId: item.generated_email_id,
    leadId: item.lead_id,
    campaignId: item.campaign_id,
    leadName: item.leads?.business_name || item.to_email,
    recipientEmail: item.to_email,
    campaignName: item.campaigns?.name || "No campaign",
    step: item.step,
    generationProvider: generated?.model || item.provider,
    subject: item.subject,
    body: item.body,
    followUp1: generated?.follow_up_1 || null,
    followUp2: generated?.follow_up_2 || null,
    followUp3: generated?.follow_up_3 || null,
    status: item.status,
    scheduledAt: item.scheduled_at,
    sentAt: item.sent_at,
    providerMessageId: item.provider_message_id,
    errorMessage: item.error_message
  };
}

export function sentPreview(item: SentEmail & { leads: Lead | null; campaigns: Campaign | null; generated_emails?: GeneratedEmail | null }): EmailPreviewData {
  const generated = item.generated_emails || null;
  return {
    source: "sent",
    id: item.id,
    generatedEmailId: item.generated_email_id,
    leadId: item.lead_id,
    campaignId: item.campaign_id,
    leadName: item.leads?.business_name || item.to_email,
    recipientEmail: item.to_email,
    campaignName: item.campaigns?.name || "No campaign",
    step: item.step,
    generationProvider: generated?.model || item.provider,
    subject: item.subject,
    body: item.body,
    followUp1: generated?.follow_up_1 || null,
    followUp2: generated?.follow_up_2 || null,
    followUp3: generated?.follow_up_3 || null,
    status: item.status,
    scheduledAt: null,
    sentAt: item.sent_at,
    providerMessageId: item.provider_message_id,
    errorMessage: item.error_message
  };
}

export async function listGeneratedEmailPreviews(): Promise<EmailPreviewData[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("generated_emails")
    .select("*, leads(*)")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  const campaigns = await listCampaigns();
  const campaignNames = new Map(campaigns.map((campaign) => [campaign.id, campaign.name]));
  return ((data || []) as Array<GeneratedEmail & { leads: Lead }>).map((item) => generatedPreview(item, item.campaign_id ? campaignNames.get(item.campaign_id) || "No campaign" : "No campaign"));
}

export async function listQueueEmailPreviews(): Promise<EmailPreviewData[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_queue")
    .select("*, leads(*), campaigns(*), generated_emails(*)")
    .order("scheduled_at", { ascending: true });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return ((data || []) as Array<EmailQueueItem & { leads: Lead | null; campaigns: Campaign | null; generated_emails: GeneratedEmail | null }>).map(queuePreview);
}

export async function listSentEmailPreviews(): Promise<EmailPreviewData[]> {
  return (await listSentEmails()).map(sentPreview);
}

export async function getAutomationPreview() {
  const [queuePreviews, settings] = await Promise.all([listQueueEmailPreviews(), getSettings()]);
  const dailyLimit = Number(settings?.daily_send_limit || 25);
  const dailyLimitRemaining = Math.max(dailyLimit - (await countSentToday()), 0);
  const dueEmails = queuePreviews
    .filter((item) => item.status === "queued" && item.scheduledAt && new Date(item.scheduledAt) <= new Date())
    .slice(0, dailyLimitRemaining);
  return { dueEmails, dailyLimitRemaining };
}

export async function listRecentActivity(limit = 15): Promise<ActivityLog[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return data || [];
}

export async function logActivity({
  leadId,
  campaignId,
  type,
  message,
  metadata
}: {
  leadId?: string | null;
  campaignId?: string | null;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdmin();
  await supabase.from("activity_logs").insert({
    lead_id: leadId || null,
    campaign_id: campaignId || null,
    type,
    message,
    metadata: metadata || {}
  });
}

export async function countQueuedDueNow() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("email_queue")
    .select("id", { count: "exact", head: true })
    .eq("status", "queued")
    .lte("scheduled_at", new Date().toISOString());
  if (error) {
    if (isMissingSchemaError(error)) return 0;
    throwReadableError(error);
  }
  return count || 0;
}

export async function getReportStats() {
  const supabase = getSupabaseAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(today);
  week.setDate(week.getDate() - 6);

  const [leads, reviewItems, queueItems, campaigns, recentActivity] = await Promise.all([
    listLeads(),
    listReviewItems(),
    listQueueItems(),
    listCampaigns(),
    listRecentActivity(20)
  ]);

  const { data: sentEmails } = await supabase.from("sent_emails").select("*").order("sent_at", { ascending: false });
  const sent = sentEmails || [];
  const sentToday = sent.filter((item) => item.sent_at && new Date(item.sent_at) >= today);
  const sentThisWeek = sent.filter((item) => item.sent_at && new Date(item.sent_at) >= week);
  const replies = leads.filter((lead) => ["Replied"].includes(lead.status) || lead.sequence_status === "replied");
  const interested = leads.filter((lead) => lead.sequence_status === "interested");
  const converted = leads.filter((lead) => lead.status === "Converted" || lead.sequence_status === "converted");
  const failed = queueItems.filter((item) => item.status === "failed").length;

  return {
    leads,
    campaigns,
    queueItems,
    recentActivity,
    sent,
    sentToday,
    sentThisWeek,
    totalSent: sent.length,
    generated: reviewItems.length,
    pendingReview: reviewItems.filter((item) => item.status !== "Approved" && item.status !== "Sent").length,
    scheduled: queueItems.filter((item) => item.status === "queued").length,
    followupsDueToday: queueItems.filter((item) => item.status === "queued" && item.step !== "initial" && new Date(item.scheduled_at) <= new Date()).length,
    replies: replies.length,
    interested: interested.length,
    notInterested: leads.filter((lead) => lead.status === "Not Interested" || lead.sequence_status === "not_interested").length,
    converted: converted.length,
    failed,
    replyRate: sent.length ? Math.round((replies.length / sent.length) * 100) : 0,
    interestedRate: sent.length ? Math.round((interested.length / sent.length) * 100) : 0,
    conversionRate: sent.length ? Math.round((converted.length / sent.length) * 100) : 0
  };
}

export async function listFollowUps(): Promise<Lead[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .in("status", ["Follow-up Needed", "Sent"])
    .order("follow_up_due_at", { ascending: true, nullsFirst: false });
  if (error) {
    if (isMissingSchemaError(error)) return [];
    throwReadableError(error);
  }
  return data || [];
}

export async function countDraftsToday() {
  const supabase = getSupabaseAdmin();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("gmail_drafts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since.toISOString());
  if (error) {
    if (isMissingSchemaError(error)) return 0;
    throwReadableError(error);
  }
  return count || 0;
}

export async function countSentToday() {
  const supabase = getSupabaseAdmin();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("sent_emails")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", since.toISOString());
  if (error) {
    if (isMissingSchemaError(error)) return 0;
    throwReadableError(error);
  }
  return count || 0;
}
