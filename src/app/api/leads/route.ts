import { NextResponse } from "next/server";
import { z } from "zod";
import { SERVICE_OPTIONS } from "@/lib/constants";
import { requireApiAuth } from "@/lib/api-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const leadSchema = z.object({
  business_name: z.string().min(1),
  contact_name: z.string().optional().nullable(),
  email: z.string().email(),
  website: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  service_to_pitch: z.enum(SERVICE_OPTIONS),
  notes: z.string().optional().nullable()
});

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const payload = leadSchema.parse(await request.json());
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").upsert(payload, { onConflict: "email", ignoreDuplicates: true }).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
