import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency Outreach Desk",
  description: "Private AI cold outreach dashboard for agency use."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
