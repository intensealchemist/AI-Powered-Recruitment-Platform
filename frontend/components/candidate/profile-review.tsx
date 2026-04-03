"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Copy, Link2, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  publishProfileAction,
  regenerateShareTokenAction,
  saveDraftAction,
} from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PdfDownloadButton } from "@/components/shared/pdf-download-button";
import { getMissingSections } from "@/lib/profile";
import { CandidateProfile } from "@/lib/types";
import { absoluteUrl, formatDateLabel } from "@/lib/utils";

export function ProfileReview({ initialProfile }: { initialProfile: CandidateProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [pending, startTransition] = useTransition();
  const shareUrl = absoluteUrl(`/p/${profile.shareToken}`);
  const missing = getMissingSections(profile);

  return (
    <div className="space-y-5">

      {/* ── Header + publish actions ── */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
              Step 6 of 6
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
              Review and publish your profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-2)]">
              Your profile is{" "}
              <span className="font-semibold text-[var(--text-1)]">{profile.completionScore}%</span>{" "}
              complete. Recruiters see this score exactly, so incomplete sections stay transparent
              without blocking submission.
            </p>
          </div>

          {/* Completeness summary */}
          <div className="min-w-64 rounded-[16px] border border-[var(--primary-border)] bg-[var(--primary-muted)] p-5">
            <Progress
              value={profile.completionScore}
              showValue
              label="Profile completeness"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {missing.length > 0 ? (
                missing.map((item) => (
                  <Badge
                    key={item}
                    className="border-amber-500/25 bg-amber-500/10 text-amber-400 text-[10px]"
                  >
                    Missing: {item}
                  </Badge>
                ))
              ) : (
                <Badge className="border-[var(--success-border)] bg-[var(--success-muted)] text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Everything essential is covered
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() =>
              startTransition(async () => {
                await publishProfileAction();
                // Server action redirects to /candidate/confirmation — no client state update needed
              })
            }
            type="button"
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {pending ? "Publishing…" : "Publish profile"}
          </Button>
          <Button
            onClick={() =>
              startTransition(async () => {
                const next = await saveDraftAction();
                setProfile(next);
                toast.success("Draft saved.");
              })
            }
            type="button"
            variant="secondary"
            disabled={pending}
          >
            Save as draft
          </Button>
          <PdfDownloadButton profileId={profile.id} />
        </div>

        {/* Published share link */}
        {profile.publishedAt && (
          <div className="mt-5 rounded-[16px] border border-[var(--success-border)] bg-[var(--success-muted)]/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">
                Published and shareable
              </span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <p className="flex-1 rounded-[10px] border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 font-ai text-xs text-[var(--text-2)] break-all">
                {shareUrl}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Share link copied.");
                  }}
                  type="button"
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="size-3.5" />
                  Copy link
                </Button>
                <Button
                  onClick={() =>
                    startTransition(async () => {
                      const next = await regenerateShareTokenAction();
                      setProfile(next);
                      toast.success("Share token regenerated. Old link revoked.");
                    })
                  }
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pending}
                >
                  <Link2 className="size-3.5" />
                  Revoke &amp; refresh
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Profile preview ── */}
      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] text-[var(--text-3)]">Preview — candidate view</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--text-1)]">{profile.name}</h2>
            <p className="mt-1 text-base text-[var(--text-2)]">{profile.headline}</p>
          </div>
          <Badge className="border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]">
            {profile.availability}
          </Badge>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left column */}
          <div className="space-y-5">
            {/* AI summary */}
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                AI-generated summary
              </h3>
              <div className="rounded-[14px] border border-[var(--ai-border)] bg-[var(--ai-muted)]/60 px-5 py-4 text-sm leading-relaxed text-[var(--text-1)]">
                {profile.aiSummary || profile.summary}
              </div>
            </section>

            {/* Experience */}
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Experience
              </h3>
              <div className="space-y-3">
                {profile.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--text-1)]">{exp.title}</p>
                        <p className="text-sm text-[var(--text-3)]">{exp.company}</p>
                      </div>
                      <span className="shrink-0 text-[10px] uppercase tracking-widest text-[var(--text-4)]">
                        {formatDateLabel(exp.startDate)} —{" "}
                        {exp.current ? "Present" : formatDateLabel(exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                        {exp.description}
                      </p>
                    )}
                    {exp.structuredPoints.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {exp.structuredPoints.map((point) => (
                          <li key={point} className="flex gap-2 text-sm text-[var(--text-2)]">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-[var(--primary)]" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Skills */}
            <section>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
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
            </section>

            {/* Projects */}
            {profile.projects.length > 0 && (
              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Projects
                </h3>
                <div className="space-y-3">
                  {profile.projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4"
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
              </section>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <section>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Education
                </h3>
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <p className="font-semibold text-[var(--text-1)]">{edu.degree}</p>
                      <p className="mt-1 text-sm text-[var(--text-3)]">
                        {edu.institution}
                        {edu.year ? ` · ${edu.year}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
