import type { LeadStatus, ServiceOption } from "@/lib/constants";

export type Lead = {
  id: string;
  campaign_id: string | null;
  business_name: string;
  contact_name: string | null;
  email: string;
  website: string | null;
  instagram: string | null;
  industry: string | null;
  location: string | null;
  service_to_pitch: ServiceOption;
  notes: string | null;
  audit_problem: string | null;
  audit_opportunity: string | null;
  audit_pitch_angle: string | null;
  audit_opening_line: string | null;
  audit_generated_at: string | null;
  status: LeadStatus;
  sequence_status: SequenceStatus | null;
  current_step: string | null;
  next_action_at: string | null;
  last_sent_at: string | null;
  replied_at: string | null;
  reply_status: string | null;
  unsubscribed_at: string | null;
  closed_at: string | null;
  follow_up_due_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GeneratedEmail = {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  lead_observation: string;
  subject: string;
  body: string;
  follow_up_1: string;
  follow_up_2: string;
  follow_up_3: string | null;
  edited_subject: string | null;
  edited_body: string | null;
  approved_subject: string | null;
  approved_body: string | null;
  approved_at: string | null;
  status: string;
  model: string | null;
  prompt_version: string;
  created_at: string;
  updated_at: string;
};

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type SequenceStatus =
  | "new"
  | "generated"
  | "review_needed"
  | "approved"
  | "scheduled"
  | "initial_sent"
  | "followup1_due"
  | "followup1_sent"
  | "followup2_due"
  | "followup2_sent"
  | "followup3_due"
  | "followup3_sent"
  | "replied"
  | "interested"
  | "not_interested"
  | "converted"
  | "unsubscribed"
  | "closed"
  | "failed";

export type Campaign = {
  id: string;
  name: string;
  service_to_pitch: string;
  target_industry: string | null;
  description: string | null;
  status: CampaignStatus;
  daily_send_limit: number;
  working_hours_start: string;
  working_hours_end: string;
  send_weekends: boolean;
  followup1_delay_days: number;
  followup2_delay_days: number;
  followup3_delay_days: number;
  created_at: string;
  updated_at: string;
};

export type EmailQueueItem = {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  generated_email_id: string;
  step: "initial" | "followup1" | "followup2" | "followup3";
  to_email: string;
  subject: string;
  body: string;
  status: "queued" | "sending" | "sent" | "failed" | "skipped" | "cancelled";
  scheduled_at: string;
  sent_at: string | null;
  provider: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type SentEmail = {
  id: string;
  lead_id: string;
  generated_email_id: string;
  campaign_id: string | null;
  step: "initial" | "followup1" | "followup2" | "followup3";
  provider: string;
  provider_message_id: string | null;
  to_email: string;
  from_email: string;
  subject: string;
  body: string;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
};

export type EmailPreviewData = {
  source: "generated" | "queue" | "sent";
  id: string;
  generatedEmailId?: string | null;
  leadId: string;
  campaignId: string | null;
  leadName: string;
  recipientEmail: string;
  campaignName: string;
  step: "initial" | "followup1" | "followup2" | "followup3";
  generationProvider: string | null;
  subject: string;
  body: string;
  followUp1: string | null;
  followUp2: string | null;
  followUp3: string | null;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
};

export type ActivityLog = {
  id: string;
  lead_id: string | null;
  campaign_id: string | null;
  type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AgencySettings = {
  id: string;
  sender_name: string;
  agency_name: string;
  portfolio_url: string;
  reply_to_email: string;
  sender_email: string;
  default_signature: string;
  daily_draft_limit: number;
  daily_send_limit: number;
  generation_mode: "template" | "gemini" | "openai";
  require_manual_approval_before_first_send: boolean;
  default_working_hours_start: string;
  default_working_hours_end: string;
  send_weekends: boolean;
  followup1_delay_days: number;
  followup2_delay_days: number;
  followup3_delay_days: number;
  openai_api_key_encrypted: string | null;
  gmail_connected: boolean;
  bulk_unsubscribe_line: string;
};
