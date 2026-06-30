import { redirect } from "next/navigation";
import { createSession, isAuthenticated } from "@/lib/auth";
import { KeyRound } from "lucide-react";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") || "");
  const expected = process.env.PRIVATE_DASHBOARD_PASSWORD || "admin";

  if (password !== expected) {
    redirect("/login?error=1");
  }

  await createSession();
  redirect("/dashboard/email");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAuthenticated()) {
    redirect("/dashboard/email");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud px-4">
      <form action={login} className="panel w-full max-w-sm p-6">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold">Agency Outreach Desk</h1>
        <p className="mt-2 text-sm text-muted">Private access for your internal lead outreach workflow.</p>
        <label className="mt-6 block">
          <span className="field-label">Password</span>
          <input name="password" type="password" className="mt-2 w-full" autoFocus required />
        </label>
        {params.error ? <p className="mt-3 text-sm font-medium text-rose">Incorrect password.</p> : null}
        <button className="btn-primary mt-6 w-full" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
