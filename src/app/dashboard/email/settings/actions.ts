"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { upsertSettings } from "@/lib/db";

export async function saveSettings(formData: FormData) {
  await upsertSettings({
    sender_name: String(formData.get("sender_name") || "Fazil"),
    agency_name: String(formData.get("agency_name") || "Fusion Ventures"),
    portfolio_url: String(formData.get("portfolio_url") || "https://www.fusionventuresglobal.com/web-portfolio"),
    reply_to_email: String(formData.get("reply_to_email") || ""),
    sender_email: String(formData.get("sender_email") || ""),
    default_signature: String(formData.get("default_signature") || ""),
    daily_draft_limit: Number(formData.get("daily_draft_limit") || 25),
    daily_send_limit: Number(formData.get("daily_send_limit") || 25),
    generation_mode: String(formData.get("generation_mode") || "template") as "template" | "gemini",
    require_manual_approval_before_first_send: formData.get("require_manual_approval_before_first_send") !== "off",
    default_working_hours_start: String(formData.get("default_working_hours_start") || "09:00"),
    default_working_hours_end: String(formData.get("default_working_hours_end") || "17:00"),
    send_weekends: formData.get("send_weekends") === "on",
    followup1_delay_days: Number(formData.get("followup1_delay_days") || 3),
    followup2_delay_days: Number(formData.get("followup2_delay_days") || 7),
    followup3_delay_days: Number(formData.get("followup3_delay_days") || 12),
    openai_api_key_encrypted: String(formData.get("openai_api_key") || "") || null,
    gmail_connected: Boolean(process.env.GMAIL_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN),
    bulk_unsubscribe_line: String(formData.get("bulk_unsubscribe_line") || "")
  });
  revalidatePath("/dashboard/email/settings");
  revalidatePath("/dashboard");
  redirect("/dashboard/email/settings?toast=settings-saved");
}
