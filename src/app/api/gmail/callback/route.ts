import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  const code = new URL(request.url).searchParams.get("code");

  if (!clientId || !clientSecret || !redirectUri || !code) {
    return NextResponse.json({ error: "Missing Google OAuth configuration or code." }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2Client.getToken(code);

  return NextResponse.json({
    message: "Copy GMAIL_REFRESH_TOKEN into .env.local, then restart the dev server.",
    refresh_token: tokens.refresh_token || null
  });
}
