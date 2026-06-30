import OpenAI from "openai";
import { replaceUnresolvedPlaceholders } from "@/lib/placeholders";
import type { AgencySettings, Lead } from "@/lib/types";

export type GeneratedOutreach = {
  lead_observation: string;
  subject: string;
  body: string;
  follow_up_1: string;
  follow_up_2: string;
  generation_provider: "template" | "openai";
  warning?: string;
};

export type WebsiteAuditAngle = {
  problem_noticed: string;
  opportunity: string;
  recommended_pitch_angle: string;
  opening_line: string;
};

function settingDefaults(settings: AgencySettings | null) {
  return {
    senderName: settings?.sender_name || "Fazil",
    agencyName: settings?.agency_name || "Fusion Ventures",
    portfolioUrl: settings?.portfolio_url || "https://www.fusionventuresglobal.com/web-portfolio"
  };
}

function greeting(lead: Lead) {
  return lead.contact_name ? `Hi ${lead.contact_name},` : "Hi,";
}

function businessName(lead: Lead) {
  return lead.business_name || "your business";
}

function signature(settings: AgencySettings | null) {
  const { senderName, agencyName } = settingDefaults(settings);
  return `Best regards,\n${senderName}\n${agencyName}`;
}

function serviceParagraph(lead: Lead, agencyName: string) {
  const service = lead.service_to_pitch;
  if (service === "Website redesign" || service === "Website development") {
    return `At ${agencyName}, we help service businesses improve their websites for better user experience and stronger enquiry conversion.`;
  }
  if (service === "E-commerce website") {
    return `At ${agencyName}, we help businesses make their online store clearer, easier to browse, and easier to buy from.`;
  }
  if (service === "Travel website/package pages") {
    return `At ${agencyName}, we help travel businesses make package pages clearer, more visual, and easier for visitors to enquire from.`;
  }
  if (service === "AI automation") {
    return `At ${agencyName}, we help businesses use simple AI automation to reduce manual work and respond faster.`;
  }
  if (service === "SEO") {
    return `At ${agencyName}, we help businesses improve website structure and content so the right visitors can find them more easily.`;
  }
  return `At ${agencyName}, we help businesses improve ${service.toLowerCase()} with practical, clean execution.`;
}

export function generateTemplateOutreach(lead: Lead, settings: AgencySettings | null): GeneratedOutreach {
  const { agencyName, portfolioUrl } = settingDefaults(settings);
  const name = businessName(lead);
  const industryLine = lead.industry
    ? `I came across ${name} while looking at businesses in the ${lead.industry} space, and I liked how you position your services.`
    : `I came across ${name} and liked how you present your services.`;
  const noteLine = lead.notes
    ? `I also noticed ${lead.notes.split(/\r?\n/)[0].replace(/\.$/, "")}.`
    : "I also noticed the website has useful information, but the main journey could guide visitors toward taking action a little more clearly.";
  const concept = lead.service_to_pitch === "Website redesign" || lead.service_to_pitch === "Website development"
    ? `I can prepare a short homepage concept for ${name}, based on the current brand, with a few practical notes on what I would improve and why.`
    : `I can prepare a short concept around ${lead.service_to_pitch.toLowerCase()} for ${name}, with a few practical notes on what I would improve and why.`;
  const portfolio = portfolioUrl ? `\n\nYou can see some of our recent website work here:\n${portfolioUrl}` : "";

  const output = {
    lead_observation: lead.audit_opening_line || industryLine,
    subject: `Homepage idea for ${name}`,
    body: `${greeting(lead)}\n\n${industryLine}\n\n${noteLine}\n\n${serviceParagraph(lead, agencyName)}\n\n${concept}\n\nNo obligation at all. Would you like me to prepare it?${portfolio}\n\n${signature(settings)}`,
    follow_up_1: `${greeting(lead)}\n\nJust checking if this would be useful.\n\nI can prepare a quick homepage concept for ${name} and share a few practical improvement ideas.\n\nWould you like me to send it over?\n\n${signature(settings)}`,
    follow_up_2: `${greeting(lead)}\n\nNo worries if this is not a priority right now.\n\nI just felt there may be a small opportunity to make the website journey clearer and improve enquiry flow.\n\nShould I close this for now?\n\n${signature(settings)}`,
    generation_provider: "template" as const
  };

  const safeValues = {
    "Your Name": settingDefaults(settings).senderName,
    sender_name: settingDefaults(settings).senderName,
    agency_name: agencyName,
    business_name: name,
    contact_name: lead.contact_name || "",
    portfolio_url: portfolioUrl
  };

  return {
    ...output,
    subject: replaceUnresolvedPlaceholders(output.subject, safeValues),
    body: replaceUnresolvedPlaceholders(output.body, safeValues),
    follow_up_1: replaceUnresolvedPlaceholders(output.follow_up_1, safeValues),
    follow_up_2: replaceUnresolvedPlaceholders(output.follow_up_2, safeValues)
  };
}

export async function generateOutreach(lead: Lead, settings: AgencySettings | null, options: { forceAi?: boolean; forceTemplate?: boolean } = {}): Promise<GeneratedOutreach & { model: string }> {
  const apiKey = settings?.openai_api_key_encrypted || process.env.OPENAI_API_KEY;
  const model = "gpt-4o-mini";
  const template = () => ({
    ...generateTemplateOutreach(lead, settings),
    model: "template-fallback",
    warning: "OpenAI unavailable. Generated using template fallback."
  });

  if (options.forceTemplate || (!options.forceAi && settings?.generation_mode !== "openai")) {
    return { ...generateTemplateOutreach(lead, settings), model: "template-fallback" };
  }

  if (!apiKey) {
    return template();
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write short, human cold outreach for a private agency dashboard. No fake claims. No unresolved placeholders such as {{Your Name}}, {{sender_name}}, or {{business_name}}. Avoid spammy/corporate words: innovative, cutting-edge, synergy, revolutionary, world-class, game-changing, leading provider. Always use the provided sender_name and agency_name in the signature. Include portfolio_url only if available. End with a soft question. Output valid JSON only with observation, subject, body, followup1, followup2."
        },
        {
          role: "user",
          content: JSON.stringify({
            lead,
            saved_audit_angle: lead.audit_pitch_angle
              ? {
                  problem_noticed: lead.audit_problem,
                  opportunity: lead.audit_opportunity,
                  recommended_pitch_angle: lead.audit_pitch_angle,
                  opening_line: lead.audit_opening_line
                }
              : null,
            sender_name: settings?.sender_name || "Fazil",
            agency_name: settings?.agency_name || "Fusion Ventures",
            portfolio_url: settings?.portfolio_url || "https://www.fusionventuresglobal.com/web-portfolio",
            sender_email: settings?.sender_email,
            constraints: [
              "Keep the email under 160 words where possible.",
              "Sound human, simple, practical, and personally written.",
              "Use the saved audit angle if present.",
              "Mention one plausible observation from the lead data or notes.",
              "If contact_name is missing, start with Hi,",
              "If industry is missing, do not invent one.",
              "If notes are available, use them lightly.",
              "Never say I was genuinely impressed unless notes support it.",
              "Make the ask soft and low pressure.",
              "Use this signature format: Best regards, sender_name, agency_name.",
              "Do not include an unsubscribe line unless the user adds it later for bulk outreach.",
              "Generate two short follow-ups."
            ]
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content || "{}";
    const parsed = JSON.parse(content) as Partial<GeneratedOutreach> & {
      observation?: string;
      followup1?: string;
      followup2?: string;
    };

    return {
      lead_observation: parsed.observation || parsed.lead_observation || "",
      subject: replaceUnresolvedPlaceholders(parsed.subject || "", {
        "Your Name": settingDefaults(settings).senderName,
        sender_name: settingDefaults(settings).senderName,
        agency_name: settingDefaults(settings).agencyName,
        business_name: businessName(lead),
        contact_name: lead.contact_name || "",
        portfolio_url: settingDefaults(settings).portfolioUrl
      }),
      body: replaceUnresolvedPlaceholders(parsed.body || "", {
        "Your Name": settingDefaults(settings).senderName,
        sender_name: settingDefaults(settings).senderName,
        agency_name: settingDefaults(settings).agencyName,
        business_name: businessName(lead),
        contact_name: lead.contact_name || "",
        portfolio_url: settingDefaults(settings).portfolioUrl
      }),
      follow_up_1: replaceUnresolvedPlaceholders(parsed.followup1 || parsed.follow_up_1 || "", {
        "Your Name": settingDefaults(settings).senderName,
        sender_name: settingDefaults(settings).senderName,
        agency_name: settingDefaults(settings).agencyName,
        business_name: businessName(lead),
        contact_name: lead.contact_name || "",
        portfolio_url: settingDefaults(settings).portfolioUrl
      }),
      follow_up_2: replaceUnresolvedPlaceholders(parsed.followup2 || parsed.follow_up_2 || "", {
        "Your Name": settingDefaults(settings).senderName,
        sender_name: settingDefaults(settings).senderName,
        agency_name: settingDefaults(settings).agencyName,
        business_name: businessName(lead),
        contact_name: lead.contact_name || "",
        portfolio_url: settingDefaults(settings).portfolioUrl
      }),
      generation_provider: "openai",
      model
    };
  } catch {
    return template();
  }
}

export async function generateWebsiteAuditAngle(lead: Lead, settings: AgencySettings | null): Promise<WebsiteAuditAngle & { model: string }> {
  const apiKey = settings?.openai_api_key_encrypted || process.env.OPENAI_API_KEY;
  const model = "gpt-4o-mini";

  const fallback = () => ({
    problem_noticed: lead.notes || `There may be an opportunity to make the website journey clearer for visitors.`,
    opportunity: `Make the ${lead.service_to_pitch.toLowerCase()} angle easier to understand and act on.`,
    recommended_pitch_angle: `Offer a simple homepage or website improvement concept focused on clearer enquiry flow.`,
    opening_line: `I came across ${lead.business_name || "your business"} and noticed there may be a small opportunity to make the website journey clearer.`,
    model: "template-fallback"
  });

  if (!apiKey || settings?.generation_mode !== "openai") {
    return fallback();
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You create practical website/outreach audit angles for a private agency tool. Be specific but do not pretend to have crawled the website deeply. Use only the provided URL, industry, service, and notes. Output JSON only with problem_noticed, opportunity, recommended_pitch_angle, opening_line."
        },
        {
          role: "user",
          content: JSON.stringify({
            website: lead.website,
            industry: lead.industry,
            notes: lead.notes,
            service_to_pitch: lead.service_to_pitch,
            business_name: lead.business_name,
            location: lead.location,
            agency_name: settings?.agency_name,
            constraints: [
              "Keep each field one sentence.",
              "Use a UAE/agency-friendly tone.",
              "Avoid exaggeration and corporate buzzwords.",
              "Opening line should be usable as the first sentence of a cold email."
            ]
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content || "{}";
    const parsed = JSON.parse(content) as WebsiteAuditAngle;
    return { ...parsed, model };
  } catch {
    return {
      ...fallback(),
      model: "template-fallback"
    };
  }
}
