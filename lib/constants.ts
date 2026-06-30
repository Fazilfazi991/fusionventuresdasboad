export const SERVICE_OPTIONS = [
  "Website development",
  "Website redesign",
  "E-commerce website",
  "Travel website/package pages",
  "Branding",
  "Social media design",
  "AI automation",
  "SEO",
  "Custom software"
] as const;

export const LEAD_STATUSES = [
  "New",
  "Generated",
  "Need Review",
  "Draft Created",
  "Sent",
  "Follow-up Needed",
  "Replied",
  "Not Interested",
  "Converted",
  "Skipped"
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
