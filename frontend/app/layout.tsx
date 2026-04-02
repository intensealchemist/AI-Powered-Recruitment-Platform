import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Talentflow — Conversation-first Hiring",
    template: "%s · Talentflow",
  },
  description:
    "Replace resume uploads with AI-driven conversational profiles. Structured, comparable, bias-free hiring powered by Groq and PocketBase.",
  keywords: ["AI recruitment", "conversational hiring", "structured profiles", "Groq", "Next.js"],
  openGraph: {
    title: "Talentflow — Conversation-first Hiring",
    description:
      "AI guides candidates through structured profile building. Recruiters compare normalised profiles instead of inconsistent PDFs.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
