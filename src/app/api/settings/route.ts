import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getSettings, upsertSettings } from "@/lib/db";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  await upsertSettings(await request.json());
  return NextResponse.json({ ok: true });
}
