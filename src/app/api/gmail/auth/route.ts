import { google } from "googleapis";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Google OAuth env vars are missing." }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.compose"]
  });

  return NextResponse.redirect(url);
}
