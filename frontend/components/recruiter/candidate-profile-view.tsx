"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { GitCompareArrows, Link2, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { updateShortlistStageAction } from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PdfDownloadButton } from "@/components/shared/pdf-download-button";
import { CandidateCardData } from "@/lib/types";
import { absoluteUrl, formatDateLabel } from "@/lib/utils";

const stageOptions = ["viewed", "shortlisted", "under_review", "rejected"] as const;

export function CandidateProfileView({
  candidate,
}: {
  candidate: CandidateCardData;
}) {
  const [stage, setStage] = useState(candidate.stage);
  const [, startTransition] = useTransition();

  const shareUrl = absoluteUrl(`/p/${candidate.profile.shareToken}`);

  const initials = candidate.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-[var(--primary-muted)] text-lg font-bold text-[var(--primary-light)] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
                Recruiter profile view
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
                {candidate.name}
              </h1>
              <p className="mt-1 text-base text-[var(--text-2)]">{candidate.headline}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {/* Stage segmented control */}
            <div className="flex flex-wrap gap-1.5 rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-1.5">
              {stageOptions.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    startTransition(async () => {
                      setStage(option);
                      await updateShortlistStageAction({
                        candidateId: candidate.candidateId,
                        stage: option,
                      });
                      toast.success(`Moved to ${option.replaceAll("_", " ")}.`);
                    })
                  }
                  type="button"
                  className={[
                    "rounded-[10px] px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                    stage === option
                      ? option === "rejected"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : option === "shortlisted"
                          ? "bg-[var(--success-muted)] text-emerald-400 border border-[var(--success-border)]"
                          : "bg-[var(--primary-muted)] text-[var(--primary-light)] border border-[var(--primary-border)]"
                      : "text-[var(--text-3)] hover:bg-white/[0.05] hover:text-[var(--text-2)]",
                  ].join(" ")}
                >
                  {option.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            <Link href={`/recruiter/compare?ids=${candidate.candidateId}`}>
              <Button type="button" variant="secondary" size="sm">
                <GitCompareArrows className="size-3.5" />
                Compare
              </Button>
            </Link>
            <PdfDownloadButton profileId={candidate.profile.id} />
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Share link copied.");
              }}
              type="button"
              variant="secondary"
              size="sm"
            >
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* ── AI Summary ── */}
      <Card className="border-[var(--ai-border)] bg-[var(--ai-muted)]/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-[var(--ai)]/20">
                <Sparkles className="size-3.5 text-[var(--ai)]" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ai)]">
                AI summary
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-1)]">
              {candidate.profile.aiSummary || candidate.profile.summary}
            </p>
          </div>
          <Badge className="shrink-0 border-[var(--ai-border)] bg-[var(--ai)]/10 text-amber-300">
            {candidate.matchScore} match
          </Badge>
        </div>
      </Card>

      {/* ── Experience + Sidebar ── */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Experience */}
        <Card className="p-6">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
            Experience timeline
          </h2>
          <div className="relative space-y-4">
            {/* Vertical line */}
            {candidate.profile.experiences.length > 1 && (
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.06]" />
            )}
            {candidate.profile.experiences.length > 0 ? (
              candidate.profile.experiences.map((exp) => (
                <div key={exp.id} className="relative flex gap-4">
                  {/* Dot */}
                  <div className="mt-1 size-[9px] shrink-0 rounded-full border-2 border-[var(--primary)] bg-[var(--bg-base)]" />
                  <div className="flex-1 rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--text-1)]">{exp.title}</p>
                        <p className="text-sm text-[var(--text-3)]">{exp.company}</p>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-widest text-[var(--text-4)]">
                        {formatDateLabel(exp.startDate)} — {exp.current ? "Present" : formatDateLabel(exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                        {exp.description}
                      </p>
                    )}
                    {exp.structuredPoints.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {exp.structuredPoints.map((point) => (
                          <li key={point} className="flex gap-2 text-sm text-[var(--text-2)]">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-[var(--primary)]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[14px] border border-dashed border-white/[0.08] p-5 text-sm leading-relaxed text-[var(--text-3)]">
                No formal work history. Review the project evidence and AI summary
                instead of treating this as a negative signal.
              </div>
            )}
          </div>
        </Card>

        {/* Sidebar — Skills, Projects, Share */}
        <div className="space-y-4">
          {/* Skills */}
          <Card className="p-5">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.profile.skills.map((skill) => (
                <Badge
                  key={skill.id}
                  className={
                    skill.confirmed
                      ? "border-[var(--success-border)] bg-[var(--success-muted)] text-emerald-400"
                      : "border-white/[0.06] bg-white/[0.03] text-[var(--text-3)]"
                  }
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Projects */}
          {candidate.profile.projects.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Projects
              </h2>
              <div className="space-y-3">
                {candidate.profile.projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="font-semibold text-[var(--text-1)]">{project.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">
                      {project.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {project.techStack.map((item) => (
                        <Badge key={item}>{item}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Shareable link */}
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Shareable profile
              </h2>
              <Link2 className="size-3.5 text-[var(--text-4)]" />
            </div>
            <p className="rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-ai text-xs text-[var(--text-3)] break-all">
              {shareUrl}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
