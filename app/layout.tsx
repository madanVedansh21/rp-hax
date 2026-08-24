import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChargebackAI — Autonomous Dispute Defense",
  description:
    "AI-powered revenue recovery agent that gathers evidence via Razorpay MCP, generates bank-grade responses, and prevents lost chargebacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-surface-canvas text-ink min-h-screen antialiased flex flex-col selection:bg-brand-blue selection:text-white">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
