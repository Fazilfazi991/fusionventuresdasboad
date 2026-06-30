export type OutreachLeadInput = {
  id: string;
  business_name: string | null;
  contact_name: string | null;
  email: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  service_to_pitch: string | null;
  notes: string | null;
};

export type OutreachSettingsInput = {
  sender_name: string | null;
  agency_name: string | null;
  portfolio_url: string | null;
  reply_to_email: string | null;
  generation_mode?: "template" | "gemini" | "openai" | null;
};

export type GeneratedOutreachEmail = {
  observation: string;
  subject: string;
  body: string;
  followup1: string;
  followup2: string;
  followup3: string;
  generation_provider: "gemini" | "template";
  warning?: string;
};

export type GenerateOutreachInput = {
  lead: OutreachLeadInput;
  settings: OutreachSettingsInput | null;
};
