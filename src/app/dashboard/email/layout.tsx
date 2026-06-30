import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { destroySession, requireAuth } from "@/lib/auth";

async function logout() {
  "use server";
  await destroySession();
  redirect("/login");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <AppShell logoutAction={logout}>{children}</AppShell>;
}
