import { NextResponse } from "next/server";
import { runAutomation } from "@/lib/automation";
import { requireApiAuth } from "@/lib/api-auth";

export async function POST() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  try {
    const summary = await runAutomation();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Automation failed." },
      { status: 500 }
    );
  }
}
