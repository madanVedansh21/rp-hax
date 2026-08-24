import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChargebackAI — Autonomous Dispute Defense for Razorpay Merchants",
  description:
    "AI Revenue Recovery Agent that gathers evidence via Razorpay MCP, generates bank-grade responses, and prevents lost chargebacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col selection:bg-blue-600 selection:text-white">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
