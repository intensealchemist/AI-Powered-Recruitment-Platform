"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Grid2X2,
  List,
  SlidersHorizontal,
  Sparkles,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CandidateCardData } from "@/lib/types";

const sortOptions = [
  { label: "Match score",  value: "match"        },
  { label: "Recency",      value: "recency"       },
  { label: "Completeness", value: "completeness"  },
] as const;

function ScorePill({ score }: { score: number }) {
  const colour =
    score >= 80 ? "border-[var(--success-border)] bg-[var(--success-muted)] text-emerald-400"
    : score >= 50 ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
    : "border-white/[0.08] bg-white/[0.04] text-[var(--text-3)]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${colour}`}>
      {score}
    </span>
  );
}

export function CandidateDashboard() {
  const [view, setView]                           = useState<"table" | "card">("table");
  const [selectedSkills, setSelectedSkills]       = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates]     = useState<string[]>([]);
  const [experienceRange, setExperienceRange]     = useState(10);
  const [sortBy, setSortBy]                       = useState<(typeof sortOptions)[number]["value"]>("match");

  const { data = [] } = useQuery<CandidateCardData[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Unable to load candidates.");
      return res.json();
    },
  });

  const allSkills = useMemo(
    () =>
      Array.from(
        new Set(
          data.flatMap((c) =>
            c.skills.filter((s) => s.confirmed).map((s) => s.name),
          ),
        ),
      ).sort(),
    [data],
  );

  const availabilityOptions = useMemo(
    () => Array.from(new Set(data.map((c) => c.availability))),
    [data],
  );

  const filtered = useMemo(() => {
    const next = data
      .filter((c) =>
        selectedSkills.length === 0
          ? true
          : selectedSkills.every((s) =>
              c.skills.some((sk) => sk.confirmed && sk.name.toLowerCase() === s.toLowerCase()),
            ),
      )
      .filter((c) => c.experienceYears <= experienceRange)
      .filter((c) =>
        selectedAvailability.length === 0 ? true : selectedAvailability.includes(c.availability),
      );

    return next.sort((a, b) => {
      if (sortBy === "completeness") return b.completionScore - a.completionScore;
      if (sortBy === "recency")      return Date.parse(b.profile.updatedAt) - Date.parse(a.profile.updatedAt);
      return b.matchScore - a.matchScore;
    });
  }, [data, experienceRange, selectedAvailability, selectedSkills, sortBy]);

  const toggleSelected = (id: string) => {
    setSelectedCandidates((cur) =>
      cur.includes(id)
        ? cur.filter((i) => i !== id)
        : cur.length < 3
          ? [...cur, id]
          : cur,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row">

        {/* ── Sidebar filters ── */}
        <Card className="shrink-0 w-full xl:w-72">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-1)]">
              <SlidersHorizontal className="size-4 text-[var(--primary-light)]" />
              Filters
            </div>
          </div>

          <div className="space-y-6 p-5">
            {/* Skills filter */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        "hover:-translate-y-0.5 active:scale-[0.95]",
                        active
                          ? "border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]"
                          : "border-white/[0.08] bg-white/[0.04] text-[var(--text-2)] hover:border-white/[0.16]",
                      ].join(" ")}
                      onClick={() =>
                        setSelectedSkills((cur) =>
                          active ? cur.filter((s) => s !== skill) : [...cur, skill],
                        )
                      }
                      type="button"
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience range */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Max experience
                </p>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs tabular-nums text-[var(--text-2)]">
                  {experienceRange} yr
                </span>
              </div>
              <input
                type="range"
                className="w-full"
                min={0}
                max={10}
                value={experienceRange}
                onChange={(e) => setExperienceRange(Number(e.target.value))}
              />
            </div>

            {/* Availability */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                Availability
              </p>
              <div className="space-y-2.5">
                {availabilityOptions.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 text-sm text-[var(--text-2)]">
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes(item)}
                      onChange={(e) =>
                        setSelectedAvailability((cur) =>
                          e.target.checked ? [...cur, item] : cur.filter((v) => v !== item),
                        )
                      }
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Main panel ── */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* Dashboard header */}
          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
                  Recruiter dashboard
                </p>
                <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
                  Compare structured candidates
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-full border border-white/[0.08] bg-white/[0.04] p-1">
                  {(["table", "card"] as const).map((v) => (
                    <button
                      key={v}
                      className={[
                        "flex items-center justify-center rounded-full px-3 py-1.5 text-sm transition-all",
                        view === v
                          ? "bg-[var(--primary)] text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                          : "text-[var(--text-3)] hover:text-[var(--text-2)]",
                      ].join(" ")}
                      onClick={() => setView(v)}
                      type="button"
                      title={v === "table" ? "Table view" : "Card view"}
                    >
                      {v === "table" ? <List className="size-4" /> : <Grid2X2 className="size-4" />}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-[var(--text-2)]">
                  <ArrowUpDown className="size-3.5" />
                  <select
                    className="bg-transparent text-sm outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Compare CTA */}
                <Link
                  href={
                    selectedCandidates.length > 0
                      ? `/recruiter/compare?ids=${selectedCandidates.join(",")}`
                      : "/recruiter/compare"
                  }
                >
                  <Button type="button" variant="secondary">
                    Compare
                    {selectedCandidates.length > 0 && (
                      <span className="ml-1 rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[10px] text-white">
                        {selectedCandidates.length}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto mb-4 size-10 text-[var(--text-4)]" />
              <p className="text-lg font-semibold text-[var(--text-1)]">
                No candidates match these filters
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-2)]">
                Try clearing one filter — seeded demo profiles are available by default, so this
                usually means the filters are too narrow.
              </p>
            </Card>

          ) : view === "table" ? (
            /* ── Table view ── */
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {["", "Name", "Headline", "Skills", "Experience", "Match", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.candidateId}
                        className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(c.candidateId)}
                            onChange={() => toggleSelected(c.candidateId)}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-xs font-bold text-[var(--primary-light)]">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <Link
                              className="font-semibold text-[var(--text-1)] hover:text-[var(--primary-light)] transition-colors"
                              href={`/recruiter/candidates/${c.candidateId}`}
                            >
                              {c.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--text-2)] max-w-[200px] truncate">
                          {c.headline}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {c.skills.slice(0, 3).map((s) => (
                              <Badge key={s.id}>{s.name}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--text-2)]">
                          {c.experienceYears} yr
                        </td>
                        <td className="px-5 py-4">
                          <ScorePill score={c.matchScore} />
                        </td>
                        <td className="px-5 py-4">
                          <Badge className="capitalize">
                            {c.stage.replaceAll("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          ) : (
            /* ── Card view ── */
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map((c) => (
                <Card
                  key={c.candidateId}
                  className="group p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.candidateId)}
                        onChange={() => toggleSelected(c.candidateId)}
                      />
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-sm font-bold text-[var(--primary-light)]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-[var(--text-1)]">{c.name}</h2>
                        <p className="text-xs text-[var(--text-3)]">{c.headline}</p>
                      </div>
                    </div>
                    <ScorePill score={c.matchScore} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 4).map((s) => (
                      <Badge key={s.id}>{s.name}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-3)]">
                    <span className="flex items-center gap-1">
                      <User2 className="size-3.5" />
                      {c.experienceYears} yr experience
                    </span>
                    <span>{c.availability}</span>
                  </div>

                  <div className="mt-4">
                    <Link href={`/recruiter/candidates/${c.candidateId}`}>
                      <Button type="button" variant="secondary" size="sm">
                        View profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
