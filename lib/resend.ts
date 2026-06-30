import { Resend } from "resend";
import type { AgencySettings } from "@/lib/types";

export function getDailySendLimit(settings?: AgencySettings | null) {
  return Number(settings?.daily_send_limit || process.env.DAILY_SEND_LIMIT || 25);
}

export function getEmailSendingConfig(settings?: AgencySettings | null) {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.OUTREACH_FROM || "",
    replyTo: settings?.reply_to_email || process.env.REPLY_TO_EMAIL || "",
    dailyLimit: getDailySendLimit(settings)
  };
}

export async function sendWithResend({
  to,
  subject,
  body,
  settings
}: {
  to: string;
  subject: string;
  body: string;
  settings?: AgencySettings | null;
}) {
  const config = getEmailSendingConfig(settings);

  if (!config.apiKey) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  if (!config.from) {
    throw new Error("OUTREACH_FROM is missing.");
  }

  const resend = new Resend(config.apiKey);
  const response = await resend.emails.send({
    from: config.from,
    to,
    replyTo: config.replyTo || undefined,
    subject,
    text: body
  });

  if (response.error) {
    throw new Error(response.error.message || "Resend failed to send the email.");
  }

  return {
    id: response.data?.id || ""
  };
}
