"use server";

import { parse } from "csv-parse/sync";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { cancelFutureFollowups } from "@/lib/automation";
import { logActivity } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const leadSchema = z.object({
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

export async function createLead(formData: FormData) {
  const values = leadSchema.parse(Object.fromEntries(formData));
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("leads").upsert(values, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw error;
  await logActivity({ type: "lead_created", message: `Lead created: ${values.business_name}` });
  revalidatePath("/dashboard/email/leads");
  redirect("/dashboard/email/leads?toast=lead-added");
}

export async function uploadLeadsCsv(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("CSV file is required.");

  const text = await file.text();
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Array<Record<string, string>>;

  const leads = rows
    .map((row) => ({
      business_name: row.business_name || row.company || row.business || "",
      contact_name: row.contact_name || row.name || "",
      email: row.email || "",
      website: row.website || "",
      instagram: row.instagram || "",
      industry: row.industry || "",
      location: row.location || "",
      service_to_pitch: row.service_to_pitch || "Website development",
      notes: row.notes || ""
    }))
    .filter((row) => row.business_name && row.email)
    .map((row) => leadSchema.parse(row));

  if (leads.length) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").upsert(leads, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw error;
  }

  revalidatePath("/dashboard/email/leads");
  redirect(`/dashboard/email/leads?toast=csv-uploaded&count=${leads.length}`);
}

const statusMap: Record<string, { sequence_status: string; status: string; field?: string }> = {
  replied: { sequence_status: "replied", status: "Replied", field: "replied_at" },
  interested: { sequence_status: "interested", status: "Replied", field: "replied_at" },
  not_interested: { sequence_status: "not_interested", status: "Not Interested", field: "closed_at" },
  converted: { sequence_status: "converted", status: "Converted", field: "closed_at" },
  unsubscribed: { sequence_status: "unsubscribed", status: "Skipped", field: "unsubscribed_at" },
  closed: { sequence_status: "closed", status: "Skipped", field: "closed_at" }
};

export async function updateLeadSequenceStatus(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const status = String(formData.get("status"));
  const mapped = statusMap[status];
  if (!mapped) throw new Error("Invalid status.");

  const now = new Date().toISOString();
  const payload: Record<string, string | null> = {
    sequence_status: mapped.sequence_status,
    status: mapped.status,
    reply_status: mapped.sequence_status,
    next_action_at: null
  };
  if (mapped.field) payload[mapped.field] = now;

  const supabase = getSupabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("campaign_id").eq("id", leadId).maybeSingle();
  const { error } = await supabase.from("leads").update(payload).eq("id", leadId);
  if (error) throw error;

  await cancelFutureFollowups(leadId, `Lead marked ${mapped.sequence_status}.`);
  await logActivity({ leadId, campaignId: lead?.campaign_id || null, type: `lead_marked_${mapped.sequence_status}`, message: `Lead marked ${mapped.sequence_status}. Future follow-ups cancelled.` });
  revalidatePath("/dashboard/email/leads");
  revalidatePath("/dashboard/email/queue");
  revalidatePath("/dashboard/email/follow-ups");
  redirect("/dashboard/email/leads?toast=lead-status-updated");
}
