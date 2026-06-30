"use server";

import { revalidatePath } from "next/cache";
import { cancelFutureFollowups } from "@/lib/automation";
import { logActivity } from "@/lib/db";
import { hasUnresolvedPlaceholders } from "@/lib/placeholders";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const PATHS = ["/dashboard/email/campaigns", "/dashboard/email/review", "/dashboard/email/queue", "/dashboard/email/follow-ups", "/dashboard/email/reports", "/dashboard"];

function revalidateEmailViews() {
  for (const path of PATHS) revalidatePath(path);
}

export async function saveEmailEdits(formData: FormData) {
  const source = String(formData.get("source"));
  const id = String(formData.get("id"));
  const generatedEmailId = String(formData.get("generatedEmailId") || "");
  const step = String(formData.get("step") || "initial");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const followUp1 = String(formData.get("followUp1") || "").trim();
  const followUp2 = String(formData.get("followUp2") || "").trim();
  const followUp3 = String(formData.get("followUp3") || "").trim();

  if (!subject || !body) throw new Error("Subject and body are required.");
  if (hasUnresolvedPlaceholders(`${subject}\n${body}`)) throw new Error("Resolve placeholders before saving.");

  const supabase = getSupabaseAdmin();

  if (source === "sent") {
    throw new Error("Sent emails are read-only.");
  }

  if (source === "generated") {
    const { error } = await supabase
      .from("generated_emails")
      .update({
        edited_subject: subject,
        edited_body: body,
        follow_up_1: followUp1,
        follow_up_2: followUp2,
        follow_up_3: followUp3 || null
      })
      .eq("id", id)
      .not("status", "eq", "Sent");
    if (error) throw error;
  }

  if (source === "queue") {
    const { data: queueItem, error: queueError } = await supabase
      .from("email_queue")
      .select("id,status,generated_email_id")
      .eq("id", id)
      .maybeSingle();
    if (queueError) throw queueError;
    if (!queueItem || queueItem.status !== "queued") throw new Error("Only queued unsent emails can be edited.");

    const { error } = await supabase.from("email_queue").update({ subject, body, error_message: null }).eq("id", id).eq("status", "queued");
    if (error) throw error;

    if (generatedEmailId || queueItem.generated_email_id) {
      const generatedUpdate: Record<string, string | null> = {
        follow_up_1: followUp1,
        follow_up_2: followUp2,
        follow_up_3: followUp3 || null
      };
      if (step === "initial") Object.assign(generatedUpdate, { edited_subject: subject, edited_body: body, approved_subject: subject, approved_body: body });
      if (step === "followup1") generatedUpdate.follow_up_1 = body;
      if (step === "followup2") generatedUpdate.follow_up_2 = body;
      if (step === "followup3") generatedUpdate.follow_up_3 = body;
      const { error: generatedError } = await supabase
        .from("generated_emails")
        .update(generatedUpdate)
        .eq("id", generatedEmailId || queueItem.generated_email_id);
      if (generatedError) throw generatedError;
    }
  }

  revalidateEmailViews();
}

export async function cancelQueuedEmail(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("email_queue")
    .update({ status: "cancelled", error_message: "Cancelled manually before sending." })
    .eq("id", id)
    .eq("status", "queued");
  if (error) throw error;
  revalidateEmailViews();
}

export async function markLeadReplied(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const campaignId = String(formData.get("campaignId") || "");
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ status: "Replied", sequence_status: "replied", replied_at: now, next_action_at: null, reply_status: "replied" })
    .eq("id", leadId);
  if (error) throw error;
  await cancelFutureFollowups(leadId, "Lead marked replied.");
  await logActivity({ leadId, campaignId: campaignId || null, type: "lead_marked_replied", message: "Lead marked replied. Future follow-ups cancelled." });
  revalidateEmailViews();
}

export async function markLeadClosed(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const campaignId = String(formData.get("campaignId") || "");
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ status: "Skipped", sequence_status: "closed", closed_at: now, next_action_at: null, reply_status: "closed" })
    .eq("id", leadId);
  if (error) throw error;
  await cancelFutureFollowups(leadId, "Lead marked closed.");
  await logActivity({ leadId, campaignId: campaignId || null, type: "lead_marked_closed", message: "Lead marked closed. Future follow-ups cancelled." });
  revalidateEmailViews();
}
