import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  BarChart3,
  Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";

const features = [
  {
    icon: CheckCircle2,
    title: "Structured by design",
    description:
      "Every candidate is captured in the same schema — recruiters compare like-for-like evidence, not inconsistent PDF formatting.",
  },
  {
    icon: Layers,
    title: "Bias removed from step one",
    description:
      "The platform strips layout, typography, and design-skill signals. Evaluation starts with substance, not presentation.",
  },
  {
    icon: Share2,
    title: "One-click shareable",
    description:
      "Published profiles become ATS-friendly PDFs and clean share links instantly — no extra tooling needed.",
  },
  {
    icon: BarChart3,
    title: "Recruiter comparison view",
    description:
      "A radar-based normalised view balances completeness, skills, and delivery evidence across all candidates side by side.",
  },
];

const stats = [
  { value: "0", unit: "resumes uploaded",   description: "Fully conversation-driven" },
  { value: "100%",unit: "structured output", description: "AI-extracted, schema-backed" },
  { value: "<1s", unit: "AI response",       description: "Groq inference, real-time" },
];

const conversation = [
  { role: "ai",   text: "Tell me about yourself — what have you been working on lately?" },
  { role: "user", text: "I'm a frontend engineer at TechCorp building dashboards, improving Core Web Vitals, and working closely with design." },
  { role: "ai",   text: "Great, so you're driving performance across dashboards. What was the most impactful outcome you shipped there?" },
  { role: "user", text: "Reduced LCP from 4.8 s to 1.1 s and improved our Lighthouse score from 54 to 94." },
];

export default async function Home() {
  const user = await getSessionUser();
  const destination =
    user?.role === "recruiter"
      ? "/recruiter"
      : user?.role === "candidate"
        ? "/candidate/intro"
        : "/sign-up";

  return (
    <div className="space-y-20 pb-20">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-24 pb-20 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        aria-labelledby="hero-headline"
      >
        {/* Background gradient layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 animate-in fade-in duration-1000"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] animate-pulse" style={{ animationDuration: "5s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_80%_60%,rgba(251,191,36,0.07),transparent)] animate-pulse" style={{ animationDuration: "7s", animationDelay: "2s" }} />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_480px] lg:items-center">
          {/* Left — copy */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <Badge className="border-[var(--primary-border)] bg-[var(--primary-muted)] px-3 py-1 text-[var(--primary-light)]">
              <Sparkles className="size-3" />
              Conversation-first hiring
            </Badge>

            <div className="space-y-5">
              <h1
                id="hero-headline"
                className="text-5xl font-extrabold leading-[1.08] tracking-tight text-[var(--text-1)] sm:text-6xl lg:text-7xl"
              >
                Build your{" "}
                <span className="gradient-text">profile,</span>
                <br />
                not your resume.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[var(--text-2)]">
                AI guides candidates through structured profile building,
                handles non-linear careers gracefully, and gives recruiters
                polished, comparable profiles instead of inconsistent PDFs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={destination}>
                <Button size="lg" type="button">
                  Get started — it&apos;s free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#demo-accounts">
                <Button size="lg" type="button" variant="secondary" className="group">
                  View demo credentials
                  <ArrowDown className="size-4 ml-1.5 opacity-70 transition-transform duration-300 group-hover:translate-y-1" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {stats.map((stat) => (
                <div key={stat.unit} className="space-y-0.5">
                  <p className="text-2xl font-extrabold text-[var(--text-1)]">
                    {stat.value}{" "}
                    <span className="text-base font-semibold text-[var(--primary-light)]">
                      {stat.unit}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--text-3)]">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating AI conversation demo */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 fill-mode-both delay-300">
            {/* Glow behind card */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[32px] bg-[var(--primary-muted)] blur-3xl opacity-70 animate-pulse"
              style={{ animationDuration: "6s" }}
            />

            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#0E1023]/40 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-700 hover:-translate-y-2 hover:shadow-[0_40px_100px_rgba(99,102,241,0.25)]">
              {/* Card header */}
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-rose-500/60" />
                  <span className="size-3 rounded-full bg-amber-400/60" />
                  <span className="size-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-0.5 text-[11px] text-[var(--text-3)]">
                    <Sparkles className="size-3 text-[var(--ai)]" />
                    AI Profile Builder
                  </span>
                </div>
              </div>

              {/* Conversation */}
              <div className="space-y-3.5 p-5">
                {conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div
                      className={[
                        "max-w-[88%] rounded-[18px] px-4 py-3 text-sm leading-relaxed",
                        msg.role === "ai"
                          ? "bg-[var(--ai-muted)] border border-[var(--ai-border)] text-slate-200"
                          : "bg-[var(--primary-muted)] border border-[var(--primary-border)] text-slate-200",
                      ].join(" ")}
                    >
                      {msg.role === "ai" && (
                        <div className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--ai)]/20 px-2 py-0.5 font-ai text-[10px] font-semibold uppercase tracking-widest text-[var(--ai)]">
                          <span className="size-1.5 rounded-full bg-[var(--ai)] animate-pulse" />
                          AI
                        </div>
                      )}
                      <p className={msg.role === "ai" ? "font-ai text-[13px]" : "text-[13px]"}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-1.5 rounded-[18px] border border-[var(--ai-border)] bg-[var(--ai-muted)] px-4 py-3">
                    <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                    <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                    <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                  </div>
                </div>
              </div>

              {/* Live profile preview strip */}
              <div className="border-t border-white/[0.07] bg-[var(--bg-surface)]/60 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Live structured profile
                </p>
                <p className="text-sm font-semibold text-[var(--text-1)]">
                  Frontend Engineer · Performance
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "Core Web Vitals", "Next.js"].map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-[var(--success-border)] bg-[var(--success-muted)] px-2 py-0.5 text-[11px] text-emerald-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl" aria-labelledby="features-heading">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
            Why it works
          </p>
          <h2
            id="features-heading"
            className="mt-3 text-3xl font-bold text-[var(--text-1)] sm:text-4xl"
          >
            Hiring built for what candidates actually do
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--text-2)]">
            Traditional hiring filters on presentation skills instead of job skills. We fix that.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={[
                "group rounded-[20px] border border-white/[0.06] bg-white/[0.01] p-6 backdrop-blur-xl relative overflow-hidden",
                "hover:border-white/[0.15] hover:bg-white/[0.04]",
                "transition-all duration-500 hover:-translate-y-2",
                "hover:shadow-[0_24px_48px_rgba(0,0,0,0.6)]",
                "animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both"
              ].join(" ")}
              style={{ animationDelay: `${(i * 0.1) + 0.5}s` }}
            >
              {/* Glass subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative mb-4 inline-flex size-10 items-center justify-center rounded-[12px] bg-[var(--primary-muted)] border border-[var(--primary-border)] text-[var(--primary-light)] transition-all duration-500 group-hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] group-hover:scale-110">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--text-1)]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-2)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO CREDENTIALS ──────────────────────────────────────────── */}
      <section id="demo-accounts" className="mx-auto max-w-2xl scroll-mt-24">
        <div className="rounded-[20px] border border-[var(--ai-border)] bg-[var(--bg-surface)] p-8 text-center relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both" style={{ animationDelay: "0.8s" }}>
          
          {/* Glass background fill */}
          <div className="absolute inset-0 bg-[var(--ai-muted)] opacity-50 blur-3xl" />
          
          <div className="relative">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--ai)]" />
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--ai)]">
            Demo account
          </p>
          <p className="mt-3 text-lg font-semibold text-[var(--text-1)]">
            hire-me@anshumat.org
          </p>
          <p className="mt-1 font-ai text-sm text-[var(--text-2)]">
            Password: <span className="text-[var(--ai)]">HireMe@2025!</span>
          </p>
          <p className="mt-4 text-sm text-[var(--text-3)] max-w-md mx-auto">
            The exact same credentials work for <strong>both</strong> Candidate and Recruiter views. The log-in screen has a toggle to pick which assignment requirement you want to grade!
          </p>
          <div className="mt-5 relative">
            <Link href="/sign-in">
              <Button variant="amber" type="button" className="shadow-[0_0_24px_rgba(251,191,36,0.15)] transition-all hover:shadow-[0_0_32px_rgba(251,191,36,0.3)] hover:-translate-y-0.5">
                Try the demo
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
