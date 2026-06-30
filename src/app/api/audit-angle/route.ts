import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/api-auth";
import { getLead, getSettings } from "@/lib/db";
import { generateOutreachEmail } from "@/lib/ai";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const auditSchema = z.object({
  leadId: z.string().uuid()
});

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { leadId } = auditSchema.parse(await request.json());
  const lead = await getLead(leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (!lead.business_name || !lead.email || !lead.service_to_pitch) {
    return NextResponse.json({ error: "Business name, email, and service_to_pitch are required." }, { status: 400 });
  }

  const settings = await getSettings();
  const generated = await generateOutreachEmail({ lead, settings });
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("leads")
    .update({
      audit_problem: generated.observation,
      audit_opportunity: `Make the ${lead.service_to_pitch.toLowerCase()} angle easier to understand and act on.`,
      audit_pitch_angle: generated.subject,
      audit_opening_line: generated.observation,
      audit_generated_at: new Date().toISOString()
    })
    .eq("id", lead.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
