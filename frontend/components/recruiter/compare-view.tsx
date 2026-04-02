import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CandidateCardData } from "@/lib/types";

const CANDIDATE_COLOURS = [
  { stroke: "#6366F1", fill: "rgba(99,102,241,0.15)",  dot: "bg-[#6366F1]", label: "text-indigo-400"  },
  { stroke: "#FBBF24", fill: "rgba(251,191,36,0.12)",  dot: "bg-[#FBBF24]", label: "text-amber-400"   },
  { stroke: "#10B981", fill: "rgba(16,185,129,0.12)",  dot: "bg-[#10B981]", label: "text-emerald-400" },
] as const;

function radarPoints(values: number[]) {
  const angles = [-90, -18, 54, 126, 198];
  const center = 110;
  const radius = 82;

  return values
    .map((value, i) => {
      const rad = (angles[i] * Math.PI) / 180;
      const scaled = (value / 100) * radius;
      return `${center + Math.cos(rad) * scaled},${center + Math.sin(rad) * scaled}`;
    })
    .join(" ");
}

function gridPoints(pct: number) {
  return radarPoints(new Array(5).fill(pct));
}

const DIMENSIONS = ["Skills", "Experience", "Completeness", "Delivery", "Availability"];
const AXIS_ANCHORS = [
  { label: "Skills",        x: 110, y: 12,  textAnchor: "middle" },
  { label: "Experience",    x: 200, y: 72,  textAnchor: "start"  },
  { label: "Completeness",  x: 178, y: 192, textAnchor: "middle" },
  { label: "Delivery",      x: 42,  y: 192, textAnchor: "middle" },
  { label: "Availability",  x: 20,  y: 72,  textAnchor: "end"    },
];

export function CompareView({ candidates }: { candidates: CandidateCardData[] }) {
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <Card className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
          Comparison view
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
          Normalised radar comparison
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-2)]">
          Instead of comparing raw years alone, the radar view balances completeness, skills,
          evidence of delivery, and availability so early-career candidates are not flattened by
          tenure-only comparisons.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">

        {/* ── Radar chart ── */}
        <Card className="p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
            Radar view
          </p>

          <svg
            className="mx-auto block h-auto w-full max-w-[280px]"
            viewBox="0 0 220 220"
            aria-label="Radar comparison chart"
          >
            {/* Grid rings */}
            {[25, 50, 75, 100].map((ring) => (
              <polygon
                key={ring}
                points={gridPoints(ring)}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines */}
            {AXIS_ANCHORS.map(({ label, x, y }) => (
              <line
                key={label}
                x1={110}
                y1={110}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {/* Axis labels */}
            {AXIS_ANCHORS.map(({ label, x, y, textAnchor }) => (
              <text
                key={label}
                x={x}
                y={y}
                textAnchor={textAnchor as never}
                fill="rgba(148,163,184,0.8)"
                fontSize="8"
                fontFamily="inherit"
              >
                {label}
              </text>
            ))}

            {/* Candidate polygons */}
            {candidates.map((c, i) => {
              const colour = CANDIDATE_COLOURS[i] ?? CANDIDATE_COLOURS[0];
              const values = [
                Math.min(c.skills.filter((s) => s.confirmed).length * 18, 100),
                Math.min(c.experienceYears * 18, 100),
                c.completionScore,
                c.matchScore,
                100 - i * 12,
              ];
              return (
                <polygon
                  key={c.candidateId}
                  points={radarPoints(values)}
                  fill={colour.fill}
                  stroke={colour.stroke}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-5 space-y-2.5">
            {candidates.map((c, i) => {
              const colour = CANDIDATE_COLOURS[i] ?? CANDIDATE_COLOURS[0];
              return (
                <div key={c.candidateId} className="flex items-center gap-3 text-sm">
                  <span className={`size-2.5 shrink-0 rounded-full ${colour.dot}`} />
                  <span className={`font-semibold ${colour.label}`}>{c.name}</span>
                  <span className="text-[var(--text-3)] truncate">{c.headline}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Side-by-side candidate cards ── */}
        <div className="space-y-5">
          <div className={`grid gap-4 ${candidates.length === 1 ? "" : candidates.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {candidates.map((c, i) => {
              const colour = CANDIDATE_COLOURS[i] ?? CANDIDATE_COLOURS[0];
              return (
                <Card key={c.candidateId} className="p-5">
                  {/* Name + score */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className={`mb-1 inline-block size-1.5 rounded-full ${colour.dot}`} />
                      <h2 className="text-base font-bold text-[var(--text-1)]">{c.name}</h2>
                      <p className="text-xs text-[var(--text-3)]">{c.headline}</p>
                    </div>
                    <div className={`text-right ${colour.label}`}>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-4)]">Match</p>
                      <p className="text-xl font-bold tabular-nums">{c.matchScore}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 4).map((s) => (
                      <Badge key={s.id}>{s.name}</Badge>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 space-y-2 text-sm">
                    {[
                      ["Experience",    `${c.experienceYears} yr`],
                      ["Completeness",  `${c.completionScore}%`],
                      ["Status",         c.stage.replaceAll("_", " ")],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-[var(--text-3)]">{label}</span>
                        <span className="font-medium capitalize text-[var(--text-2)]">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Evidence */}
                  {c.profile.experiences.flatMap((e) => e.structuredPoints).length > 0 && (
                    <div className="mt-4 border-t border-white/[0.06] pt-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-4)]">
                        Top evidence
                      </p>
                      <ul className="space-y-1.5">
                        {c.profile.experiences
                          .flatMap((e) => e.structuredPoints)
                          .slice(0, 2)
                          .map((point) => (
                            <li key={point} className="flex gap-2 text-xs leading-relaxed text-[var(--text-2)]">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ background: CANDIDATE_COLOURS[i]?.stroke }} />
                              {point}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Dimension grid */}
          <Card className="p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
              Evaluation dimensions
            </p>
            <div className="grid gap-3 sm:grid-cols-5">
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim}
                  className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] px-3 py-4 text-center"
                >
                  <p className="text-xs font-semibold text-[var(--text-1)]">{dim}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
