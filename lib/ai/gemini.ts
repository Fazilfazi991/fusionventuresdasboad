import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateTemplateOutreach } from "@/lib/ai/template";
import { replaceUnresolvedPlaceholders } from "@/lib/placeholders";
import type { GeneratedOutreachEmail, GenerateOutreachInput } from "@/lib/ai/types";

function stripCodeFences(input: string) {
  return input
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function fallback(input: GenerateOutreachInput): GeneratedOutreachEmail {
  return {
    ...generateTemplateOutreach(input.lead, input.settings),
    warning: "Gemini unavailable. Generated using template fallback."
  };
}

export async function generateWithGemini(input: GenerateOutreachInput): Promise<GeneratedOutreachEmail> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return fallback(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a short, human cold outreach email.

Return valid JSON only:
{
  "observation": "",
  "subject": "",
  "body": "",
  "followup1": "",
  "followup2": "",
  "followup3": ""
}

Email rules:
- Body should be under 160 words where possible
- Sound human, simple, and direct
- No spammy/corporate words: innovative, cutting-edge, synergy, revolutionary, world-class, game-changing, leading provider
- Do not make fake claims
- Do not say "I was genuinely impressed" unless notes clearly support it
- Mention only one service_to_pitch
- End with a soft question
- Follow-ups should be short, human, non-aggressive, and guilt-free
- Use sender_name and agency_name in signature
- Include portfolio_url if available
- No unresolved placeholders like {{Your Name}}, {{sender_name}}, {{business_name}}

Lead:
${JSON.stringify(input.lead, null, 2)}

Settings:
${JSON.stringify(input.settings, null, 2)}`
            }
          ]
        }
      ]
    });

    const text = stripCodeFences(result.response.text());
    const parsed = JSON.parse(text) as Partial<GeneratedOutreachEmail>;

    if (!parsed.subject || !parsed.body) {
      return fallback(input);
    }

    const safe = {
      "Your Name": input.settings?.sender_name || "Fazil",
      sender_name: input.settings?.sender_name || "Fazil",
      agency_name: input.settings?.agency_name || "Fusion Ventures",
      business_name: input.lead.business_name || "your business",
      contact_name: input.lead.contact_name || "",
      portfolio_url: input.settings?.portfolio_url || "https://www.fusionventuresglobal.com/web-portfolio"
    };

    return {
      observation: replaceUnresolvedPlaceholders(parsed.observation || "", safe),
      subject: replaceUnresolvedPlaceholders(parsed.subject, safe),
      body: replaceUnresolvedPlaceholders(parsed.body, safe),
      followup1: replaceUnresolvedPlaceholders(parsed.followup1 || "", safe),
      followup2: replaceUnresolvedPlaceholders(parsed.followup2 || "", safe),
      followup3: replaceUnresolvedPlaceholders(parsed.followup3 || fallback(input).followup3, safe),
      generation_provider: "gemini"
    };
  } catch {
    return fallback(input);
  }
}
