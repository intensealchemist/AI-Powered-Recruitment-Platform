import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";

export default async function CandidateIntroPage() {
  await requireSession("candidate");

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 items-center justify-center py-12">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-[var(--primary-muted)] rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="w-full px-6 py-10 text-center sm:px-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mx-auto flex size-16 items-center justify-center rounded-[20px] bg-[var(--ai)]/10 border border-[var(--ai)]/20 text-[var(--ai)] shadow-[0_0_32px_rgba(251,191,36,0.15)]">
          <Bot className="size-8 animate-pulse" style={{ animationDuration: "3s" }} />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--primary-light)]">
          Step 1 of 6
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[var(--text-1)] sm:text-5xl tracking-tight">
          I&apos;ll ask you a few questions to build your profile.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--text-2)]">
          No formatting needed — just talk to me naturally. I extract structure in
          real time, suggest skills, and help recruiters compare your profile fairly.
        </p>

        <div className="mx-auto mt-10 max-w-xl">
          <Progress value={16} className="h-1.5" />
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Conversational",
              description: "Tell your story naturally instead of fighting formatting.",
            },
            {
              icon: ShieldCheck,
              title: "Bias-aware",
              description: "The system focuses on structured evidence instead of document style.",
            },
            {
              icon: Bot,
              title: "Autosaved",
              description: "Every turn persists, and offline updates sync when you reconnect.",
            },
          ].map((item, i) => (
            <div 
              key={item.title} 
              className="group rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-6 text-left backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="inline-flex size-10 items-center justify-center rounded-[12px] bg-[var(--primary-muted)] border border-[var(--primary-border)] text-[var(--primary-light)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                <item.icon className="size-5" />
              </div>
              <p className="mt-5 font-semibold text-[var(--text-1)]">{item.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-3)]">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Link href="/candidate/builder">
            <Button size="lg" type="button" className="h-14 px-10 text-base shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-all hover:shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
              Let&apos;s begin
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
