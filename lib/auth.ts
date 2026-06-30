import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE_NAME = "agency_outreach_session";

function secret() {
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession() {
  const value = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return false;
  const [value, signature] = session.split(".");
  if (!value || !signature) return false;
  const expected = sign(value);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
