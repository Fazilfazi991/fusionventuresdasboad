import { generateWithGemini } from "@/lib/ai/gemini";
import { generateTemplateOutreach } from "@/lib/ai/template";
import type { GeneratedOutreachEmail, GenerateOutreachInput } from "@/lib/ai/types";

export async function generateOutreachEmail(input: GenerateOutreachInput): Promise<GeneratedOutreachEmail> {
  const provider = input.settings?.generation_mode === "openai" ? "gemini" : input.settings?.generation_mode || process.env.AI_PROVIDER || "template";

  if (provider === "gemini") {
    return generateWithGemini(input);
  }

  return generateTemplateOutreach(input.lead, input.settings);
}
