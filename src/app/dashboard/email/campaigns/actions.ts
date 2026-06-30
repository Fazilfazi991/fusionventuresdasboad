"use server";

import { parse } from "csv-parse/sync";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateOutreachEmail } from "@/lib/ai";
import { cancelFutureFollowups, queueApprovedEmail } from "@/lib/automation";
import { getCampaign, getSettings, listCampaignLeads, logActivity } from "@/lib/db";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const campaignSchema = z.object({
  name: z.string().min(1),
  service_to_pitch: z.enum(SERVICE_OPTIONS),
  target_industry: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
  daily_send_limit: z.coerce.number().min(1).default(25),
  working_hours_start: z.string().default("09:00"),
  working_hours_end: z.string().default("17:00"),
  send_weekends: z.coerce.boolean().default(false),
  followup1_delay_days: z.coerce.number().min(1).default(3),
  followup2_delay_days: z.coerce.number().min(1).default(7),
  followup3_delay_days: z.coerce.number().min(1).default(12)
});

const leadImportSchema = z.object({
  business_name: z.string().min(1),
  contact_name: z.string().optional(),
  email: z.string().email(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  service_to_pitch: z.enum(SERVICE_OPTIONS),
  notes: z.string().optional()
});

async function getLatestActiveGeneratedEmail(leadId: string, campaignId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("generated_emails")
    .select("id,subject,body,status,created_at")
    .eq("lead_id", leadId)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).find((item) => !["archived", "Sent"].includes(item.status)) || null;
}

export async function createCampaign(formData: FormData) {
  const values = campaignSchema.parse({
    ...Object.fromEntries(formData),
    send_weekends: formData.get("send_weekends") === "on"
  });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("campaigns").insert(values).select("id").single();
  if (error) throw error;
  await logActivity({ campaignId: data.id, type: "campaign_created", message: `Campaign created: ${values.name}` });
  revalidatePath("/dashboard/email/campaigns");
  redirect(`/dashboard/email/campaigns/${data.id}?toast=campaign-created`);
}

export async function assignLeadToCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadId = String(formData.get("leadId"));
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ campaign_id: campaignId, service_to_pitch: campaign.service_to_pitch, sequence_status: "new" })
    .eq("id", leadId);
  if (error) throw error;
  await logActivity({ leadId, campaignId, type: "lead_assigned", message: "Lead assigned to campaign." });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=campaign-updated`);
}

async function assignLeadIdsToCampaign({
  campaignId,
  leadIds,
  reassign = false
}: {
  campaignId: string;
  leadIds: string[];
  reassign?: boolean;
}) {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found.");

  const ids = Array.from(new Set(leadIds.filter(Boolean)));
  if (!ids.length) return { assigned: 0, skipped: 0, alreadyAssigned: 0 };

  const supabase = getSupabaseAdmin();
  const { data: leads, error } = await supabase.from("leads").select("id,campaign_id").in("id", ids);
  if (error) throw error;

  const assignable = (leads || []).filter((lead) => reassign || !lead.campaign_id || lead.campaign_id === campaignId);
  const alreadyAssigned = (leads || []).filter((lead) => lead.campaign_id && lead.campaign_id !== campaignId).length;
  const assignableIds = assignable.map((lead) => lead.id);

  if (assignableIds.length) {
    const { error: updateError } = await supabase
      .from("leads")
      .update({ campaign_id: campaignId, service_to_pitch: campaign.service_to_pitch, sequence_status: "new" })
      .in("id", assignableIds);
    if (updateError) throw updateError;
  }

  const skipped = ids.length - assignableIds.length;
  await logActivity({
    campaignId,
    type: "leads_bulk_assigned",
    message: `Bulk assignment completed. Assigned ${assignableIds.length}, skipped ${skipped}.`,
    metadata: { assigned: assignableIds.length, skipped, alreadyAssigned }
  });

  return { assigned: assignableIds.length, skipped, alreadyAssigned };
}

export async function assignSelectedLeadsToCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadIds = formData.getAll("leadIds").map(String);
  const reassign = formData.get("reassign") === "on";
  const summary = await assignLeadIdsToCampaign({ campaignId, leadIds, reassign });

  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=leads-assigned&assigned=${summary.assigned}&skipped=${summary.skipped}`);
}

function applyLeadFilters<T extends { business_name: string; contact_name: string | null; email: string; website: string | null; industry: string | null; location: string | null; status: string; service_to_pitch: string; campaign_id: string | null }>(
  leads: T[],
  filters: {
    unassignedOnly: boolean;
    industry?: string;
    location?: string;
    status?: string;
    service_to_pitch?: string;
    search?: string;
  }
) {
  const search = filters.search?.trim().toLowerCase();
  return leads.filter((lead) => {
    if (filters.unassignedOnly && lead.campaign_id) return false;
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.location && lead.location !== filters.location) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.service_to_pitch && lead.service_to_pitch !== filters.service_to_pitch) return false;
    if (!search) return true;
    return [lead.business_name, lead.contact_name, lead.email, lead.website, lead.industry, lead.location, lead.service_to_pitch]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export async function assignMatchingLeadsToCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const reassign = formData.get("reassign") === "on";
  const filters = {
    unassignedOnly: formData.get("unassignedOnly") !== "false",
    industry: String(formData.get("industry") || ""),
    location: String(formData.get("location") || ""),
    status: String(formData.get("status") || ""),
    service_to_pitch: String(formData.get("service_to_pitch") || ""),
    search: String(formData.get("search") || "")
  };

  const supabase = getSupabaseAdmin();
  const { data: leads, error } = await supabase.from("leads").select("*");
  if (error) throw error;
  const matching = applyLeadFilters(leads || [], filters).map((lead) => lead.id);
  const summary = await assignLeadIdsToCampaign({ campaignId, leadIds: matching, reassign });

  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=leads-assigned&assigned=${summary.assigned}&skipped=${summary.skipped}`);
}

export async function uploadLeadsToCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("CSV file is required.");

  const text = await file.text();
  const rows = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Array<Record<string, string>>;
  const leads = rows
    .map((row) => ({
      business_name: row.business_name || row.company || row.business || "",
      contact_name: row.contact_name || row.name || "",
      email: row.email || "",
      website: row.website || "",
      instagram: row.instagram || "",
      industry: row.industry || "",
      location: row.location || "",
      service_to_pitch: row.service_to_pitch || campaign.service_to_pitch || "Website development",
      notes: row.notes || ""
    }))
    .filter((row) => row.business_name && row.email)
    .map((row) => leadImportSchema.parse(row));

  const supabase = getSupabaseAdmin();
  let imported = 0;
  let duplicates = 0;
  for (const lead of leads) {
    const { data: existing, error: existingError } = await supabase.from("leads").select("id").eq("email", lead.email).maybeSingle();
    if (existingError) throw existingError;
    if (existing?.id) {
      duplicates += 1;
      continue;
    }
    const { error } = await supabase.from("leads").insert({ ...lead, campaign_id: campaignId, sequence_status: "new" });
    if (error) throw error;
    imported += 1;
  }

  await logActivity({
    campaignId,
    type: "campaign_csv_import",
    message: `CSV import completed. Imported ${imported}, skipped ${duplicates} duplicates.`,
    metadata: { imported, duplicates }
  });

  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=campaign-csv-uploaded&count=${imported}&skipped=${duplicates}`);
}

export async function generateEmailsForCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const [campaign, settings, leads] = await Promise.all([getCampaign(campaignId), getSettings(), listCampaignLeads(campaignId)]);
  if (!campaign) throw new Error("Campaign not found.");

  const supabase = getSupabaseAdmin();
  let generatedCount = 0;
  let alreadyGenerated = 0;
  let skipped = 0;
  for (const lead of leads) {
    if (!lead.business_name || !lead.email || !lead.service_to_pitch) {
      skipped += 1;
      continue;
    }
    const existing = await getLatestActiveGeneratedEmail(lead.id, campaignId);
    if (existing) {
      alreadyGenerated += 1;
      continue;
    }

    const generated = await generateOutreachEmail({ lead, settings });
    const { data: inserted, error } = await supabase
      .from("generated_emails")
      .insert({
        lead_id: lead.id,
        lead_observation: generated.observation,
        subject: generated.subject,
        body: generated.body,
        follow_up_1: generated.followup1,
        follow_up_2: generated.followup2,
        follow_up_3: generated.followup3,
        status: settings?.require_manual_approval_before_first_send === false ? "Approved" : "Need Review",
        campaign_id: campaignId,
        model: generated.generation_provider
      })
      .select("id,subject,body")
      .single();
    if (error) throw error;

    if (settings?.require_manual_approval_before_first_send === false) {
      await supabase
        .from("generated_emails")
        .update({ approved_subject: inserted.subject, approved_body: inserted.body, approved_at: new Date().toISOString() })
        .eq("id", inserted.id);
      await queueApprovedEmail(inserted.id);
    } else {
      await supabase.from("leads").update({ status: "Need Review", sequence_status: "review_needed" }).eq("id", lead.id);
    }
    await logActivity({ leadId: lead.id, campaignId, type: "email_generated", message: `Generated using ${generated.generation_provider}.` });
    generatedCount += 1;
  }

  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  revalidatePath("/dashboard/email/review");
  revalidatePath("/dashboard/email/queue");
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=campaign-emails-generated&count=${generatedCount}&alreadyGenerated=${alreadyGenerated}&skipped=${skipped}`);
}

export async function generateEmailsForSelectedCampaignLeads(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadIds = formData.getAll("leadIds").map(String);
  const [campaign, settings] = await Promise.all([getCampaign(campaignId), getSettings()]);
  if (!campaign) throw new Error("Campaign not found.");
  const supabase = getSupabaseAdmin();

  let generatedCount = 0;
  let alreadyGenerated = 0;
  let skipped = 0;
  for (const leadId of leadIds) {
    const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).eq("campaign_id", campaignId).maybeSingle();
    if (leadError) throw leadError;
    if (!lead?.business_name || !lead?.email || !lead?.service_to_pitch) {
      skipped += 1;
      continue;
    }
    const existing = await getLatestActiveGeneratedEmail(lead.id, campaignId);
    if (existing) {
      alreadyGenerated += 1;
      continue;
    }
    const generated = await generateOutreachEmail({ lead, settings });
    const { error } = await supabase.from("generated_emails").insert({
      lead_id: lead.id,
      campaign_id: campaignId,
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
    await supabase.from("leads").update({ status: "Need Review", sequence_status: "review_needed" }).eq("id", lead.id);
    generatedCount += 1;
  }

  await logActivity({ campaignId, type: "selected_emails_generated", message: `Generated emails for ${generatedCount} selected leads. ${alreadyGenerated} already had generated emails.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  revalidatePath("/dashboard/email/review");
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=campaign-emails-generated&count=${generatedCount}&alreadyGenerated=${alreadyGenerated}&skipped=${skipped}`);
}

export async function regenerateEmailForCampaignLead(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadId = String(formData.get("leadId"));
  const [campaign, settings] = await Promise.all([getCampaign(campaignId), getSettings()]);
  if (!campaign) throw new Error("Campaign not found.");

  const supabase = getSupabaseAdmin();
  const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).eq("campaign_id", campaignId).maybeSingle();
  if (leadError) throw leadError;
  if (!lead) throw new Error("Lead not found.");

  const existing = await getLatestActiveGeneratedEmail(lead.id, campaignId);
  const generated = await generateOutreachEmail({ lead, settings });
  const payload = {
    lead_id: lead.id,
    campaign_id: campaignId,
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
    status: "Need Review",
    model: generated.generation_provider
  };

  if (existing) {
    const { error } = await supabase.from("generated_emails").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("generated_emails").insert(payload);
    if (error) throw error;
  }

  await supabase.from("leads").update({ status: "Need Review", sequence_status: "review_needed" }).eq("id", lead.id);
  await logActivity({ leadId: lead.id, campaignId, type: "email_regenerated", message: `Regenerated using ${generated.generation_provider}.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  revalidatePath("/dashboard/email/review");
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=email-regenerated`);
}

export async function approveGeneratedEmailsForSelectedLeads(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadIds = formData.getAll("leadIds").map(String);
  const supabase = getSupabaseAdmin();
  let approved = 0;
  let alreadyQueued = 0;
  let skipped = 0;

  for (const leadId of leadIds) {
    const generated = await getLatestActiveGeneratedEmail(leadId, campaignId);
    if (!generated || !["Need Review", "Draft", "Approved"].includes(generated.status)) {
      skipped += 1;
      continue;
    }
    await supabase
      .from("generated_emails")
      .update({ approved_subject: generated.subject, approved_body: generated.body, approved_at: new Date().toISOString(), status: "Approved" })
      .eq("id", generated.id);
    const result = await queueApprovedEmail(generated.id);
    approved += result.queued;
    alreadyQueued += result.alreadyQueued;
  }

  await logActivity({ campaignId, type: "selected_emails_approved", message: `Approved and queued ${approved} selected generated emails. ${alreadyQueued} were already queued.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  revalidatePath("/dashboard/email/queue");
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=emails-approved&count=${approved}&alreadyQueued=${alreadyQueued}&skipped=${skipped}`);
}

export async function removeSelectedLeadsFromCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadIds = formData.getAll("leadIds").map(String);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("leads").update({ campaign_id: null, sequence_status: "new", next_action_at: null }).eq("campaign_id", campaignId).in("id", leadIds);
  if (error) throw error;
  await supabase.from("email_queue").update({ status: "cancelled", error_message: "Lead removed from campaign." }).eq("campaign_id", campaignId).in("lead_id", leadIds).eq("status", "queued");
  await logActivity({ campaignId, type: "leads_removed", message: `Removed ${leadIds.length} selected leads from campaign.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=leads-removed&count=${leadIds.length}`);
}

export async function markSelectedLeadsClosed(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadIds = formData.getAll("leadIds").map(String);
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("leads")
    .update({ status: "Skipped", sequence_status: "closed", closed_at: now, next_action_at: null })
    .eq("campaign_id", campaignId)
    .in("id", leadIds);
  if (error) throw error;
  for (const leadId of leadIds) {
    await cancelFutureFollowups(leadId, "Lead marked closed.");
  }
  await logActivity({ campaignId, type: "leads_closed", message: `Marked ${leadIds.length} selected leads as closed.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=lead-status-updated&count=${leadIds.length}`);
}

export async function updateCampaignLeadStatus(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  const leadId = String(formData.get("leadId"));
  const status = String(formData.get("status"));
  const now = new Date().toISOString();
  const updates: Record<string, string | null> = { next_action_at: null, reply_status: status };

  if (status === "replied") Object.assign(updates, { status: "Replied", sequence_status: "replied", replied_at: now });
  if (status === "interested") Object.assign(updates, { status: "Replied", sequence_status: "interested", replied_at: now });
  if (status === "not_interested") Object.assign(updates, { status: "Not Interested", sequence_status: "not_interested", closed_at: now });
  if (status === "closed") Object.assign(updates, { status: "Skipped", sequence_status: "closed", closed_at: now });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("leads").update(updates).eq("id", leadId).eq("campaign_id", campaignId);
  if (error) throw error;
  await cancelFutureFollowups(leadId, `Lead marked ${status}.`);
  await logActivity({ leadId, campaignId, type: `lead_marked_${status}`, message: `Lead marked ${status}. Future follow-ups cancelled.` });
  revalidatePath(`/dashboard/email/campaigns/${campaignId}`);
  redirect(`/dashboard/email/campaigns/${campaignId}?toast=lead-status-updated`);
}
