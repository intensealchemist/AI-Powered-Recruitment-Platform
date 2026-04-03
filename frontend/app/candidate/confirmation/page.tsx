import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { requireSession } from "@/lib/auth";
import { getCandidateProfile } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const metadata = {
  title: "Profile Published — AI-Powered Recruitment Platform",
  description:
    "Your structured profile is live. Share it with recruiters or download your ATS-friendly PDF.",
};

export default async function ConfirmationPage() {
  const user    = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  const shareUrl = profile?.shareToken
    ? absoluteUrl(`/p/${profile.shareToken}`)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 py-12">

      {/* ── Success icon ── */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-2xl" aria-hidden="true" />
        <div className="relative flex size-20 items-center justify-center rounded-full border border-[var(--success-border)] bg-[var(--success-muted)] shadow-[0_0_32px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="size-10 text-emerald-400" />
        </div>
      </div>

      {/* ── Heading ── */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Step 6 of 6 — Complete
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[var(--text-1)]">
          Your profile is live!
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--text-2)]">
          Recruiters can now discover your structured profile. Share the link
          directly or download an ATS-friendly PDF — no resume upload ever needed.
        </p>
      </div>

      {/* ── Share link card ── */}
      {shareUrl && (
        <Card className="w-full p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Share2 className="size-4" />
            Your shareable link
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="flex-1 overflow-hidden rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 font-ai text-xs text-[var(--text-2)] truncate">
              {shareUrl}
            </p>
            <CopyLinkButton url={shareUrl} />
          </div>
        </Card>
      )}

      {/* ── Action cards ── */}
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex size-10 items-center justify-center rounded-[12px] border border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]">
            <Download className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-1)]">Download PDF</h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              Generate an ATS-friendly structured resume from your profile data.
            </p>
          </div>
          <Link href="/candidate/review" className="mt-auto">
            <Button type="button" variant="secondary" size="sm" className="w-full">
              Go to review page
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex size-10 items-center justify-center rounded-[12px] border border-[var(--ai-border)] bg-[var(--ai-muted)] text-[var(--ai)]">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-1)]">Keep building</h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              Add more experience, projects, or let the AI refine your auto-summary.
            </p>
          </div>
          <Link href="/candidate/builder" className="mt-auto">
            <Button type="button" size="sm" className="w-full">
              Back to AI builder
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* ── What happens next ── */}
      <Card className="w-full p-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
          What happens next
        </p>
        <ol className="space-y-3">
          {[
            { n: "1", text: "Recruiters discover your profile through our matching dashboard." },
            { n: "2", text: "They compare your skills and evidence side-by-side with other candidates." },
            { n: "3", text: "If shortlisted, you move through their review pipeline automatically." },
            { n: "4", text: "You can update your profile at any time — changes sync instantly." },
          ].map((step) => (
            <li key={step.n} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--primary-border)] bg-[var(--primary-muted)] text-[10px] font-bold text-[var(--primary-light)]">
                {step.n}
              </span>
              <span className="text-[var(--text-2)]">{step.text}</span>
            </li>
          ))}
        </ol>
      </Card>

    </div>
  );
}
