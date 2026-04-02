"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { updateShortlistStageAction } from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CandidateCardData, ShortlistStage } from "@/lib/types";

const COLUMNS: Array<{
  key: ShortlistStage;
  label: string;
  accent: string;
  countClass: string;
}> = [
  {
    key: "viewed",
    label: "Viewed",
    accent: "border-white/[0.08] bg-white/[0.02]",
    countClass: "border-white/[0.08] bg-white/[0.04] text-[var(--text-2)]",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    accent: "border-[var(--primary-border)]/40 bg-[var(--primary-muted)]/30",
    countClass: "border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]",
  },
  {
    key: "under_review",
    label: "Under Review",
    accent: "border-amber-500/20 bg-amber-500/[0.06]",
    countClass: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  },
  {
    key: "rejected",
    label: "Rejected",
    accent: "border-rose-500/15 bg-rose-500/[0.05]",
    countClass: "border-rose-500/20 bg-rose-500/[0.08] text-rose-400",
  },
];

export function ShortlistBoard({
  candidates,
}: {
  candidates: CandidateCardData[];
}) {
  const [items, setItems] = useState(candidates);
  const [draggingOver, setDraggingOver] = useState<ShortlistStage | null>(null);
  const [, startTransition] = useTransition();

  const moveCandidate = (candidateId: string, stage: ShortlistStage) => {
    setItems((cur) =>
      cur.map((c) => (c.candidateId === candidateId ? { ...c, stage } : c)),
    );
    startTransition(async () => {
      await updateShortlistStageAction({ candidateId, stage });
    });
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <Card className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
          Shortlist pipeline
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
          Drag candidates across review stages
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-2)]">
          Changes are saved automatically. Re-order stages at any time.
        </p>
      </Card>

      {/* ── Kanban board ── */}
      <div className="flex gap-4 overflow-x-auto pb-4 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0">
        {COLUMNS.map((col) => {
          const colItems = items.filter((c) => c.stage === col.key);
          const isDragTarget = draggingOver === col.key;

          return (
            <div
              key={col.key}
              className={[
                "shrink-0 w-72 sm:w-80 xl:w-auto rounded-[20px] border p-4 transition-all duration-200",
                col.accent,
                isDragTarget
                  ? "border-[var(--primary)] shadow-[0_0_0_2px_rgba(99,102,241,0.2),0_0_32px_rgba(99,102,241,0.15)]"
                  : "",
              ].join(" ")}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingOver(col.key);
              }}
              onDragLeave={() => setDraggingOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingOver(null);
                const id = e.dataTransfer.getData("text/plain");
                moveCandidate(id, col.key);
              }}
            >
              {/* Column header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text-1)]">{col.label}</h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${col.countClass}`}
                >
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {colItems.map((c) => (
                  <div
                    key={c.candidateId}
                    draggable
                    className={[
                      "cursor-grab rounded-[14px] border border-white/[0.07] bg-[var(--bg-surface)] p-4",
                      "shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
                      "transition-all duration-200",
                      "active:cursor-grabbing active:scale-[0.98] active:shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
                      "hover:border-white/[0.12] hover:-translate-y-0.5",
                    ].join(" ")}
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", c.candidateId)
                    }
                  >
                    {/* Name + score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[10px] font-bold text-[var(--primary-light)]">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/recruiter/candidates/${c.candidateId}`}
                            className="text-sm font-semibold text-[var(--text-1)] hover:text-[var(--primary-light)] transition-colors"
                          >
                            {c.name}
                          </Link>
                          <p className="text-[11px] text-[var(--text-3)] leading-tight">{c.headline}</p>
                        </div>
                      </div>
                      <Badge className="shrink-0 border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)] tabular-nums">
                        {c.matchScore}
                      </Badge>
                    </div>

                    {/* Skills */}
                    {c.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 3).map((s) => (
                          <Badge key={s.id} className="text-[10px]">{s.name}</Badge>
                        ))}
                        {c.skills.length > 3 && (
                          <span className="text-[10px] text-[var(--text-4)]">+{c.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Availability + experience */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-4)]">
                      <span>{c.experienceYears} yr</span>
                      <span>{c.availability}</span>
                    </div>
                  </div>
                ))}

                {/* Empty column placeholder */}
                {colItems.length === 0 && (
                  <div className={[
                    "rounded-[12px] border border-dashed border-white/[0.06] py-8 text-center text-xs text-[var(--text-4)]",
                    isDragTarget ? "border-[var(--primary)]/40 bg-[var(--primary-muted)]/30" : "",
                  ].join(" ")}>
                    {isDragTarget ? "Drop here" : "No candidates yet"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
