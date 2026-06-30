import { replaceUnresolvedPlaceholders } from "@/lib/placeholders";
import type { GeneratedOutreachEmail, OutreachLeadInput, OutreachSettingsInput } from "@/lib/ai/types";

function defaults(settings: OutreachSettingsInput | null) {
  return {
    senderName: settings?.sender_name || "Fazil",
    agencyName: settings?.agency_name || "Fusion Ventures",
    portfolioUrl: settings?.portfolio_url || "https://www.fusionventuresglobal.com/web-portfolio"
  };
}

function businessName(lead: OutreachLeadInput) {
  return lead.business_name || "your business";
}

function greeting(lead: OutreachLeadInput) {
  return lead.contact_name ? `Hi ${lead.contact_name},` : "Hi,";
}

function serviceParagraph(service: string | null, agencyName: string) {
  if (service === "E-commerce website") {
    return `At ${agencyName}, we help businesses make their online store clearer, easier to browse, and easier to buy from.`;
  }
  if (service === "Travel website/package pages") {
    return `At ${agencyName}, we help travel businesses make package pages clearer and easier for visitors to enquire from.`;
  }
  if (service === "AI automation") {
    return `At ${agencyName}, we help businesses use simple AI automation to reduce manual work and respond faster.`;
  }
  if (service === "SEO") {
    return `At ${agencyName}, we help businesses improve website structure and content so the right visitors can find them more easily.`;
  }
  return `At ${agencyName}, we help businesses improve their websites for better user experience and stronger enquiry conversion.`;
}

function signature(settings: OutreachSettingsInput | null) {
  const { senderName, agencyName } = defaults(settings);
  return `Best regards,\n${senderName}\n${agencyName}`;
}

function sanitize(output: GeneratedOutreachEmail, lead: OutreachLeadInput, settings: OutreachSettingsInput | null) {
  const safe = {
    "Your Name": defaults(settings).senderName,
    sender_name: defaults(settings).senderName,
    agency_name: defaults(settings).agencyName,
    business_name: businessName(lead),
    contact_name: lead.contact_name || "",
    portfolio_url: defaults(settings).portfolioUrl
  };

  return {
    ...output,
    observation: replaceUnresolvedPlaceholders(output.observation, safe),
    subject: replaceUnresolvedPlaceholders(output.subject, safe),
    body: replaceUnresolvedPlaceholders(output.body, safe),
    followup1: replaceUnresolvedPlaceholders(output.followup1, safe),
    followup2: replaceUnresolvedPlaceholders(output.followup2, safe),
    followup3: replaceUnresolvedPlaceholders(output.followup3, safe)
  };
}

export function generateTemplateOutreach(lead: OutreachLeadInput, settings: OutreachSettingsInput | null): GeneratedOutreachEmail {
  const name = businessName(lead);
  const { agencyName, portfolioUrl } = defaults(settings);
  const intro = lead.industry
    ? `I came across ${name} while looking at businesses in the ${lead.industry} space, and liked how you present your services.`
    : `I came across ${name} and liked how you present your services.`;
  const observation = lead.notes
    ? `I noticed ${lead.notes.split(/\r?\n/)[0].replace(/\.$/, "")}.`
    : "I noticed there may be an opportunity to make the homepage journey clearer and guide visitors toward enquiry or booking a little more smoothly.";
  const service = lead.service_to_pitch || "Website redesign";
  const concept = service === "Website redesign" || service === "Website development"
    ? `I'd be happy to create a simple homepage redesign concept for ${name}, based on your existing brand, with a short explanation of what we'd improve and why.`
    : `I'd be happy to create a simple ${service.toLowerCase()} concept for ${name}, with a short explanation of what we'd improve and why.`;
  const portfolio = portfolioUrl ? `\n\nYou can see some of our recent website work here:\n${portfolioUrl}` : "";

  return sanitize(
    {
      observation,
      subject: `Homepage idea for ${name}`,
      body: `${greeting(lead)}\n\n${intro}\n\n${observation}\n\n${serviceParagraph(service, agencyName)}\n\n${concept}\n\nNo obligation at all. If the ideas are useful, we can continue the conversation. If not, you still get a fresh perspective.${portfolio}\n\nWould you like me to prepare the concept?\n\n${signature(settings)}`,
      followup1: `${greeting(lead)}\n\nJust checking if this would be useful.\n\nI can prepare a quick homepage concept for ${name} and share a few practical improvement ideas.\n\nWould you like me to send it over?\n\n${signature(settings)}`,
      followup2: `${greeting(lead)}\n\nNo worries if this is not a priority right now.\n\nI just felt there may be a small opportunity to make the website journey clearer and improve enquiry flow.\n\nShould I close this for now?\n\n${signature(settings)}`,
      followup3: `${greeting(lead)}\n\nI'll close the loop after this.\n\nIf improving the website or enquiry flow becomes useful later, happy to share a few practical ideas for ${name}.\n\nShould I leave this with you for now?\n\n${signature(settings)}`,
      generation_provider: "template"
    },
    lead,
    settings
  );
}
