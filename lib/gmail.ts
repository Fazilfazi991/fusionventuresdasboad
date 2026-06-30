import { google } from "googleapis";

function encodeMessage(message: string) {
  return Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createGmailDraft({
  to,
  from,
  subject,
  body
}: {
  to: string;
  from: string;
  subject: string;
  body: string;
}) {
  const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
    return {
      id: `mock-draft-${Date.now()}`,
      mocked: true
    };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const raw = encodeMessage([`To: ${to}`, `From: ${from}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=utf-8", "", body].join("\n"));

  const draft = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw }
    }
  });

  return { id: draft.data.id || "", mocked: false };
}
