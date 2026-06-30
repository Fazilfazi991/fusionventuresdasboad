"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateOutreachEmail } from "@/lib/ai";
import { queueApprovedEmail } from "@/lib/automation";
import { getLead, getSettings, logActivity } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/server";

async function getLatestActiveGeneratedEmail(leadId: string, campaignId: string | null) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("generated_emails")
    .select("id,subject,body,status,created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  query = campaignId ? query.eq("campaign_id", campaignId) : query.is("campaign_id", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).find((item) => !["archived", "Sent"].includes(item.status)) || null;
}

export async function generateForLead(formData: FormData) {
  let destination = "/dashboard/email/leads?toast=generate-error";
  try {
    const leadId = String(formData.get("leadId"));
    const lead = await getLead(leadId);
    if (!lead || !lead.business_name || !lead.email || !lead.service_to_pitch) {
      destination = "/dashboard/email/leads?toast=generate-validation-error";
    } else {
      const settings = await getSettings();
      const generated = await generateOutreachEmail({ lead, settings });
      const supabase = getSupabaseAdmin();
      const existing = await getLatestActiveGeneratedEmail(lead.id, lead.campaign_id);
      if (existing) {
        destination = "/dashboard/email/review?toast=already-generated";
        revalidatePath("/dashboard/email/review");
      } else {
        const { error } = await supabase.from("generated_emails").insert({
          lead_id: lead.id,
          campaign_id: lead.campaign_id,
          lead_observation: generated.observation,
          subject: generated.subject,
          body: generated.body,
          follow_up_1: generated.followup1,
          follow_up_2: generated.followup2,
          follow_up_3: generated.followup3,
          status: "Need Review",
          model: generated.generation_provider
        });
        if (error) throw error;

        const { error: statusError } = await supabase.from("leads").update({ status: "Need Review", sequence_status: "review_needed" }).eq("id", lead.id);
        if (statusError) {
          await supabase.from("leads").update({ status: "Generated" }).eq("id", lead.id);
        }
        await supabase.from("outreach_events").insert({
          lead_id: lead.id,
          event_type: "Generated",
          notes: generated.warning || `Generated using ${generated.generation_provider}.`
        });

        revalidatePath("/dashboard/email/leads");
        revalidatePath("/dashboard/email/review");
        destination = generated.warning ? "/dashboard/email/review?toast=template-fallback-used" : "/dashboard/email/review?toast=email-generated";
      }
    }
  } catch {
    destination = "/dashboard/email/leads?toast=generate-error";
  }
  redirect(destination);
}

export async function generateForAllNewLeads() {
  let destination = "/dashboard/email/leads?toast=bulk-generate-error";
  try {
    const supabase = getSupabaseAdmin();
    const settings = await getSettings();
    const { data: leads, error } = await supabase.from("leads").select("*").eq("status", "New").not("email", "is", null);
    if (error) throw error;

    let count = 0;
    for (const lead of leads || []) {
      if (!lead.business_name || !lead.email || !lead.service_to_pitch) continue;
      const generated = await generateOutreachEmail({ lead, settings });
      const existing = await getLatestActiveGeneratedEmail(lead.id, lead.campaign_id || null);
      if (existing) continue;
      const { error: insertError } = await supabase.from("generated_emails").insert({
        lead_id: lead.id,
        campaign_id: lead.campaign_id || null,
        lead_observation: generated.observation,
        subject: generated.subject,
        body: generated.body,
        follow_up_1: generated.followup1,
        follow_up_2: generated.followup2,
        follow_up_3: generated.followup3,
        status: "Need Review",
        model: generated.generation_provider
      });
      if (!insertError) {
        const { error: statusError } = await supabase.from("leads").update({ status: "Need Review", sequence_status: "review_needed" }).eq("id", lead.id);
        if (statusError) {
          await supabase.from("leads").update({ status: "Generated" }).eq("id", lead.id);
        }
        count += 1;
      }
    }

    revalidatePath("/dashboard/email/leads");
    revalidatePath("/dashboard/email/review");
    destination = `/dashboard/email/leads?toast=bulk-generated&count=${count}`;
  } catch {
    destination = "/dashboard/email/leads?toast=bulk-generate-error";
  }
  redirect(destination);
}

export async function generateAuditAngle(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const returnTo = String(formData.get("returnTo") || "/dashboard/email/review");
  let destination = `${returnTo}?toast=audit-error`;
  try {
    const lead = await getLead(leadId);
    if (!lead || !lead.business_name || !lead.email || !lead.service_to_pitch) {
      destination = `${returnTo}?toast=audit-validation-error`;
    } else {
      const settings = await getSettings();
      const generated = await generateOutreachEmail({ lead, settings });
      const audit = {
        problem_noticed: generated.observation,
        opportunity: `Make the ${lead.service_to_pitch.toLowerCase()} angle easier to understand and act on.`,
        recommended_pitch_angle: generated.subject,
        opening_line: generated.observation,
        model: generated.generation_provider
      };
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("leads")
        .update({
          audit_problem: audit.problem_noticed,
          audit_opportunity: audit.opportunity,
          audit_pitch_angle: audit.recommended_pitch_angle,
          audit_opening_line: audit.opening_line,
          audit_generated_at: new Date().toISOString()
        })
        .eq("id", lead.id);
      if (error) throw error;

      await supabase.from("outreach_events").insert({ lead_id: lead.id, event_type: "Audit Angle Generated", notes: `Generated with ${audit.model}.` });
      revalidatePath("/dashboard/email/leads");
      revalidatePath("/dashboard/email/review");
      destination = `${returnTo}?toast=audit-generated`;
    }
  } catch {
    destination = `${returnTo}?toast=audit-error`;
  }
  redirect(destination);
}

export async function regenerateEmail(formData: FormData) {
  const generatedId = String(formData.get("generatedId"));
  const leadId = String(formData.get("leadId"));
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Lead not found.");

  const settings = await getSettings();
  const generated = await generateOutreachEmail({ lead, settings });
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("generated_emails")
    .update({
      lead_observation: generated.observation,
      subject: generated.subject,
      body: generated.body,
      follow_up_1: generated.followup1,
      follow_up_2: generated.followup2,
      follow_up_3: generated.followup3,
      edited_subject: null,
      edited_body: null,
      model: generated.generation_provider
    })
    .eq("id", generatedId);
  if (error) throw error;

  revalidatePath("/dashboard/email/review");
  redirect("/dashboard/email/review?toast=email-regenerated");
}

export async function regenerateWithTemplate(formData: FormData) {
  const generatedId = String(formData.get("generatedId"));
  const leadId = String(formData.get("leadId"));
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Lead not found.");

  const settings = await getSettings();
  const generated = await generateOutreachEmail({
    lead,
    settings: {
      sender_name: settings?.sender_name || null,
      agency_name: settings?.agency_name || null,
      portfolio_url: settings?.portfolio_url || null,
      reply_to_email: settings?.reply_to_email || null,
      generation_mode: "template"
    }
  });
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("generated_emails")
    .update({
      lead_observation: generated.observation,
      subject: generated.subject,
      body: generated.body,
      follow_up_1: generated.followup1,
      follow_up_2: generated.followup2,
      follow_up_3: generated.followup3,
      edited_subject: null,
      edited_body: null,
      approved_subject: null,
      approved_body: null,
      approved_at: null,
      status: "Draft",
      model: generated.generation_provider
    })
    .eq("id", generatedId);
  if (error) throw error;

  revalidatePath("/dashboard/email/review");
  redirect("/dashboard/email/review?toast=template-regenerated");
}

export async function regenerateWithAi(formData: FormData) {
  const generatedId = String(formData.get("generatedId"));
  const leadId = String(formData.get("leadId"));
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Lead not found.");

  const settings = await getSettings();
  const generated = await generateOutreachEmail({
    lead,
    settings: {
      sender_name: settings?.sender_name || null,
      agency_name: settings?.agency_name || null,
      portfolio_url: settings?.portfolio_url || null,
      reply_to_email: settings?.reply_to_email || null,
      generation_mode: "gemini"
    }
  });
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("generated_emails")
    .update({
      lead_observation: generated.observation,
      subject: generated.subject,
      body: generated.body,
      follow_up_1: generated.followup1,
      follow_up_2: generated.followup2,
      follow_up_3: generated.followup3,
      edited_subject: null,
      edited_body: null,
      approved_subject: null,
      approved_body: null,
      approved_at: null,
      status: "Draft",
      model: generated.generation_provider
    })
    .eq("id", generatedId);
  if (error) throw error;

  revalidatePath("/dashboard/email/review");
  redirect("/dashboard/email/review?toast=ai-regenerated");
}

export async function approveEmail(formData: FormData) {
  const generatedId = String(formData.get("generatedId"));
  const leadId = String(formData.get("leadId"));
  const subject = String(formData.get("subject"));
  const body = String(formData.get("body"));
  const lead = await getLead(leadId);
  if (!lead) throw new Error("Lead not found.");

  const supabase = getSupabaseAdmin();
  const { data: currentGenerated, error: currentGeneratedError } = await supabase
    .from("generated_emails")
    .select("lead_id,campaign_id")
    .eq("id", generatedId)
    .maybeSingle();
  if (currentGeneratedError) throw currentGeneratedError;
  const latest = currentGenerated ? await getLatestActiveGeneratedEmail(currentGenerated.lead_id, currentGenerated.campaign_id || null) : null;
  const approvalId = latest?.id || generatedId;
  const approvedAt = new Date().toISOString();
  await supabase
    .from("generated_emails")
    .update({ edited_subject: subject, edited_body: body, approved_subject: subject, approved_body: body, approved_at: approvedAt, status: "Approved" })
    .eq("id", approvalId);
  await queueApprovedEmail(approvalId);
  await logActivity({ leadId: lead.id, campaignId: lead.campaign_id, type: "email_approved", message: "Email approved and queued." });

  revalidatePath("/dashboard/email/review");
  revalidatePath("/dashboard/email/queue");
  revalidatePath("/dashboard");
  redirect("/dashboard/email/review?toast=email-approved");
}

export async function approveSelected(formData: FormData) {
  const supabase = getSupabaseAdmin();
  const ids = formData.getAll("generatedIds").map(String).filter(Boolean);
  const processedLeadCampaigns = new Set<string>();
  let approved = 0;
  let alreadyQueued = 0;
  for (const id of ids) {
    const { data } = await supabase.from("generated_emails").select("id,lead_id,campaign_id,subject,body,created_at,status").eq("id", id).maybeSingle();
    if (!data) continue;
    const key = `${data.lead_id}:${data.campaign_id || "none"}`;
    if (processedLeadCampaigns.has(key)) continue;
    processedLeadCampaigns.add(key);
    const latest = await getLatestActiveGeneratedEmail(data.lead_id, data.campaign_id || null);
    if (!latest) continue;
    await supabase
      .from("generated_emails")
      .update({ approved_subject: latest.subject, approved_body: latest.body, approved_at: new Date().toISOString(), status: "Approved" })
      .eq("id", latest.id);
    const result = await queueApprovedEmail(latest.id);
    approved += result.queued;
    alreadyQueued += result.alreadyQueued;
  }
  revalidatePath("/dashboard/email/review");
  revalidatePath("/dashboard/email/queue");
  redirect(`/dashboard/email/review?toast=emails-approved&count=${approved}&alreadyQueued=${alreadyQueued}`);
}

export async function skipLead(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const supabase = getSupabaseAdmin();
  await supabase.from("leads").update({ status: "Skipped" }).eq("id", leadId);
  await supabase.from("outreach_events").insert({ lead_id: leadId, event_type: "Skipped", notes: "Skipped during manual review." });
  revalidatePath("/dashboard/email/review");
  revalidatePath("/dashboard/email/leads");
  redirect("/dashboard/email/review?toast=lead-skipped");
}
