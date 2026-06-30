import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function requireApiAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
