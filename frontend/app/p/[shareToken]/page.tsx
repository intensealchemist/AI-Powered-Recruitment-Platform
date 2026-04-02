import Link from "next/link";
import { ArrowLeft, Link2, Sparkles } from "lucide-react";

import { PdfDownloadButton } from "@/components/shared/pdf-download-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublishedProfileByShareToken } from "@/lib/data";
import { formatDateLabel } from "@/lib/utils";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const profile = await getPublishedProfileByShareToken(shareToken);

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-14rem)] w-full max-w-3xl items-center justify-center">
        <Card className="w-full p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-[16px] bg-white/[0.04] border border-white/[0.08]">
            <Link2 className="size-6 text-[var(--text-3)]" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--primary-light)]">
            Link unavailable
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
            This profile hasn&apos;t been published or the link was revoked.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-2)]">
            Ask the candidate for their latest share link or return to the platform home page.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button type="button" variant="secondary">
                <ArrowLeft className="size-4" />
                Back to home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">

      {/* ── Hero header ── */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[16px] bg-[var(--primary-muted)] text-lg font-bold text-[var(--primary-light)] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
                Shared candidate profile
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-base text-[var(--text-2)]">{profile.headline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]">
              {profile.availability}
            </Badge>
            <PdfDownloadButton profileId={profile.id} />
          </div>
        </div>
      </Card>

      {/* ── Read-only notice ── */}
      <div className="flex items-center gap-3 rounded-[14px] border border-[var(--ai-border)] bg-[var(--ai-muted)]/50 px-5 py-3.5 text-sm">
        <Sparkles className="size-4 shrink-0 text-[var(--ai)]" />
        <p className="text-[var(--text-2)]">
          <span className="font-semibold text-[var(--ai)]">Read-only.</span>{" "}
          This share link always reflects the candidate&apos;s latest published profile.
        </p>
      </div>

      {/* ── Content grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">

        {/* Left — AI summary + Experience */}
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              AI-generated summary
            </h2>
            <div className="rounded-[12px] border border-[var(--ai-border)] bg-[var(--ai-muted)]/50 px-5 py-4 text-sm leading-relaxed text-[var(--text-1)]">
              {profile.aiSummary || profile.summary}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Experience
            </h2>
            <div className="relative space-y-4">
              {profile.experiences.length > 1 && (
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.06]" />
              )}
              {profile.experiences.length > 0 ? (
                profile.experiences.map((exp) => (
                  <div key={exp.id} className="relative flex gap-4">
                    <div className="mt-1 size-[9px] shrink-0 rounded-full border-2 border-[var(--primary)] bg-[var(--bg-base)]" />
                    <div className="flex-1 rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4">
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
                        <ul className="mt-3 space-y-1.5">
                          {exp.structuredPoints.map((point: string) => (
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
                <div className="rounded-[12px] border border-dashed border-white/[0.08] p-5 text-sm text-[var(--text-3)]">
                  No formal work history was published on this profile.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right — Skills, Projects, Education */}
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Skills
            </h2>
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
          </Card>

          {profile.projects.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Projects
              </h2>
              <div className="space-y-3">
                {profile.projects.map((project) => (
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

          {profile.education.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widests text-[var(--text-3)]">
                Education
              </h2>
              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="font-semibold text-[var(--text-1)]">{edu.degree}</p>
                    <p className="mt-1 text-sm text-[var(--text-3)]">
                      {edu.institution}
                      {edu.year ? ` · ${edu.year}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
