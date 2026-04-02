"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Edit3, LoaderCircle, RotateCcw, Send, WifiOff } from "lucide-react";
import { toast } from "sonner";

import {
  addManualSkillAction,
  confirmSkillAction,
  processConversationAction,
  updateManualProfileFallbackAction,
} from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CandidateProfile } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

const queueKey   = "talentflow-offline-queue";
const sessionKey = "talentflow-session-id";
const deviceKey  = "talentflow-device-id";

export function ProfileBuilder({
  initialProfile,
}: {
  initialProfile: CandidateProfile;
}) {
  const [profile, setProfile]                 = useState(initialProfile);
  const [message, setMessage]                 = useState("");
  const [manualSkill, setManualSkill]         = useState("");
  const [saveLabel, setSaveLabel]             = useState("Saved just now");
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualHeadline, setManualHeadline]   = useState(initialProfile.headline);
  const [manualSummary, setManualSummary]     = useState(initialProfile.summary);
  const [manualCompany, setManualCompany]     = useState(initialProfile.experiences[0]?.company ?? "");
  const [manualTitle, setManualTitle]         = useState(initialProfile.experiences[0]?.title ?? "");
  const [isPending, startTransition]          = useTransition();
  const [isSyncing, setIsSyncing]             = useState(false);
  const [isOnline, setIsOnline]               = useState(true);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "server-session";
    const existing = window.localStorage.getItem(sessionKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(sessionKey, next);
    return next;
  }, []);

  const deviceId = useMemo(() => {
    if (typeof window === "undefined") return "server-device";
    const existing = window.localStorage.getItem(deviceKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(deviceKey, next);
    return next;
  }, []);

  useEffect(() => { setProfile(initialProfile); }, [initialProfile]);

  useEffect(() => {
    if (!saveLabel) return;
    const timeout = window.setTimeout(() => setSaveLabel(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [saveLabel]);

  useEffect(() => {
    const syncQueuedMessages = async () => {
      const queued = JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as string[];
      if (queued.length === 0 || !navigator.onLine) return;
      setIsSyncing(true);
      for (const item of queued) {
        const result = await processConversationAction({ message: item, sessionId, deviceId });
        setProfile(result.profile);
        setShowManualFallback(result.mode === "manual");
      }
      window.localStorage.removeItem(queueKey);
      setSaveLabel("Synced just now");
      setIsSyncing(false);
    };

    syncQueuedMessages().catch(() => { setIsSyncing(false); });
    setIsOnline(window.navigator.onLine);

    const handleOnline  = () => { setIsOnline(true);  syncQueuedMessages().catch(() => undefined); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [deviceId, sessionId]);

  const conversation =
    profile.conversationLogs.find((item) => item.sessionId === sessionId)?.messages ??
    profile.conversationLogs[0]?.messages ?? [];

  const handleSend = () => {
    if (!message.trim()) return;
    const nextMessage = message.trim();
    setMessage("");
    if (!isOnline) {
      const queued = JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as string[];
      queued.push(nextMessage);
      window.localStorage.setItem(queueKey, JSON.stringify(queued));
      setSaveLabel("Saved offline");
      toast.info("You are offline. Your message is queued and will resend on reconnect.");
      return;
    }
    startTransition(async () => {
      const result = await processConversationAction({ message: nextMessage, sessionId, deviceId });
      setProfile(result.profile);
      setShowManualFallback(result.mode === "manual");
      setManualHeadline(result.profile.headline);
      setManualSummary(result.profile.summary);
      setSaveLabel("Saved just now");
    });
  };

  const toggleSkill = (skillId: string, confirmed: boolean) => {
    startTransition(async () => {
      const next = await confirmSkillAction(skillId, confirmed);
      setProfile(next);
      setSaveLabel("Saved just now");
    });
  };

  const addSkill = () => {
    if (!manualSkill.trim()) return;
    startTransition(async () => {
      const next = await addManualSkillAction(manualSkill);
      setProfile(next);
      setManualSkill("");
      setSaveLabel("Saved just now");
    });
  };

  const saveManualFallback = () => {
    startTransition(async () => {
      const next = await updateManualProfileFallbackAction({
        headline: manualHeadline,
        summary:  manualSummary,
        company:  manualCompany,
        title:    manualTitle,
      });
      setProfile(next);
      setSaveLabel("Saved just now");
      toast.success("Manual details saved.");
    });
  };

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-surface)] shadow-2xl">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-white/[0.06] bg-white/[0.02] px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
                Step 2 of 6
              </p>
              <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
                Conversational AI profile builder
              </h1>
            </div>
            <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-sm text-[var(--text-2)]">
              {isSyncing ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin text-[var(--primary)]" />
                  Syncing…
                </>
              ) : (
                saveLabel || "Autosave ready"
              )}
            </div>
          </div>
          <Progress
            className="mt-4"
            value={profile.completionScore}
            showValue
            label="Profile completeness"
          />
        </div>

        {/* ── Two-column body ── */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

          {/* LEFT — Conversation */}
          <div className="flex min-h-0 flex-1 flex-col border-b border-white/[0.06] bg-[var(--bg-base)] lg:border-b-0 lg:border-r">
            <div className="flex min-h-0 flex-1 flex-col p-6">
              {/* Controls row */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[var(--text-3)]">
                  Ask naturally. AI structures as you speak.
                </p>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-3)] transition hover:bg-white/[0.05] hover:text-[var(--text-2)]"
                  onClick={() => {
                    setMessage("");
                    setManualHeadline("");
                    setManualSummary("");
                  }}
                  type="button"
                >
                  <RotateCcw className="size-3.5" />
                  Start over
                </button>
              </div>

              {/* Messages area */}
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {/* Initial prompt placeholder */}
                {conversation.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-[16px] border border-[var(--ai-border)] bg-[var(--ai-muted)] px-4 py-3 text-sm">
                      <div className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--ai)]/20 px-2 py-0.5 font-ai text-[10px] font-semibold uppercase tracking-widest text-[var(--ai)]">
                        <span className="size-1.5 animate-pulse rounded-full bg-[var(--ai)]" />
                        AI
                      </div>
                      <p className="font-ai text-[13px] text-slate-200">
                        Tell me about yourself — what have you been working on lately?
                      </p>
                    </div>
                  </div>
                )}

                {conversation.map((item) => (
                  <div
                    key={`${item.createdAt}-${item.role}`}
                    className={`flex ${item.role === "assistant" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={[
                        "max-w-[90%] rounded-[16px] px-4 py-3 text-sm leading-relaxed",
                        item.role === "assistant"
                          ? "border border-[var(--ai-border)] bg-[var(--ai-muted)] text-slate-200"
                          : "border border-[var(--primary-border)] bg-[var(--primary-muted)] text-slate-200",
                      ].join(" ")}
                    >
                      {item.role === "assistant" && (
                        <div className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--ai)]/20 px-2 py-0.5 font-ai text-[10px] font-semibold uppercase tracking-widest text-[var(--ai)]">
                          <span className="size-1.5 animate-pulse rounded-full bg-[var(--ai)]" />
                          AI
                        </div>
                      )}
                      <p className={item.role === "assistant" ? "font-ai text-[13px]" : "text-[13px]"}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isPending && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-1.5 rounded-[16px] border border-[var(--ai-border)] bg-[var(--ai-muted)] px-4 py-3">
                      <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                      <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                      <span className="typing-dot size-1.5 rounded-full bg-[var(--ai)]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Offline banner */}
              {!isOnline && (
                <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-300">
                  <WifiOff className="size-4 shrink-0" />
                  Offline — messages queue locally and resync on reconnect.
                </div>
              )}

              {/* Input */}
              <div className="mt-4 shrink-0 space-y-2 border-t border-white/[0.06] pt-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Tell the AI what you've been working on lately…"
                  className="min-h-[88px]"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[var(--text-4)]">
                    Enter to send · Shift+Enter for new line
                  </p>
                  <Button
                    onClick={handleSend}
                    type="button"
                    disabled={!message.trim() || isPending}
                  >
                    {isPending
                      ? <LoaderCircle className="size-4 animate-spin" />
                      : <Send className="size-4" />}
                    Send
                  </Button>
                </div>
              </div>

              {/* Manual fallback */}
              {showManualFallback && (
                <div className="mt-4 rounded-[16px] border border-[var(--ai-border)] bg-[var(--ai-muted)]/50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full border border-[var(--ai-border)] bg-[var(--ai)]/10 p-2 text-[var(--ai)]">
                      <Edit3 className="size-4" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-sm font-semibold text-[var(--text-1)]">
                          AI is resting — enter your details manually.
                        </h2>
                        <p className="mt-0.5 text-xs text-[var(--text-3)]">
                          Appears automatically when Groq is unavailable or rate-limited.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="Headline"
                          value={manualHeadline}
                          onChange={(e) => setManualHeadline(e.target.value)}
                        />
                        <Input
                          placeholder="Current company"
                          value={manualCompany}
                          onChange={(e) => setManualCompany(e.target.value)}
                        />
                        <Input
                          placeholder="Current title"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                        />
                        <div className="sm:col-span-2">
                          <Textarea
                            placeholder="Professional summary"
                            value={manualSummary}
                            onChange={(e) => setManualSummary(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={saveManualFallback}
                        type="button"
                        variant="amber"
                        disabled={isPending}
                      >
                        {isPending && <LoaderCircle className="size-4 animate-spin" />}
                        Save details
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Live preview */}
          <div className="custom-scrollbar w-full overflow-y-auto bg-white/[0.01] p-6 lg:w-[450px] xl:w-[500px]">
            <div className="mx-auto max-w-2xl space-y-5">
              {/* Next step CTA */}
              <div className="rounded-[16px] border border-[var(--primary-border)] bg-[var(--primary-muted)]/50 p-5 text-center">
                <h3 className="text-sm font-bold text-[var(--text-1)]">
                  Ready to move forward?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-2)]">
                  Once the AI has captured your core experience, continue to finalize and publish your profile so recruiters can discover you.
                </p>
                <Link href="/candidate/review" className="mt-4 block">
                  <Button className="w-full" type="button">
                    Continue to review &amp; publish
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>

              {/* Headline + summary */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ai)]">
                  Live structured preview
                </p>
                <h2 className="mt-2 text-xl font-bold text-[var(--text-1)] leading-snug">
                  {profile.headline || "Your headline will appear here"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                  {profile.aiSummary ||
                    profile.summary ||
                    "AI-generated summary appears here as the profile fills in."}
                </p>
              </div>

              {/* Skills */}
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                    Skills
                  </h3>
                  <span className="text-[11px] text-[var(--text-4)]">
                    Tap to confirm
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <button
                      key={skill.id}
                      className={[
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        "transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.95]",
                        skill.confirmed
                          ? "border-[var(--success-border)] bg-[var(--success-muted)] text-emerald-400"
                          : "border-white/[0.1] bg-white/[0.05] text-[var(--text-3)] hover:border-[var(--success-border)] hover:text-emerald-400",
                      ].join(" ")}
                      onClick={() => toggleSkill(skill.id, !skill.confirmed)}
                      type="button"
                    >
                      {skill.name}
                      {!skill.confirmed && (
                        <span className="ml-1 text-[10px] opacity-50">· confirm?</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Add a skill…"
                    value={manualSkill}
                    onChange={(e) => setManualSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
                    className="h-9 text-xs"
                  />
                  <Button
                    onClick={addSkill}
                    type="button"
                    variant="secondary"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Experience */}
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Experience
                </h3>
                <div className="space-y-3">
                  {profile.experiences.length > 0 ? (
                    profile.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="group rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4 transition-colors hover:border-white/[0.1]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-1)]">
                              {exp.title}
                            </p>
                            <p className="text-xs text-[var(--text-3)]">{exp.company}</p>
                          </div>
                          <Button
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Edit3 className="size-3.5" />
                          </Button>
                        </div>
                        <p className="mt-1.5 text-[10px] uppercase tracking-widest text-[var(--text-4)]">
                          {formatDateLabel(exp.startDate)} —{" "}
                          {exp.current ? "Present" : formatDateLabel(exp.endDate)}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-xs leading-relaxed text-[var(--text-2)]">
                            {exp.description}
                          </p>
                        )}
                        {exp.structuredPoints.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.structuredPoints.map((point) => (
                              <li key={point} className="flex gap-2 text-xs text-[var(--text-2)]">
                                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--primary)]" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-white/[0.08] p-4 text-xs leading-relaxed text-[var(--text-3)]">
                      No formal work history yet is fine — the AI captures freelance, study,
                      caregiving, and projects just as well.
                    </div>
                  )}
                </div>
              </div>

              {/* Role recommendations */}
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-3)]">
                  Role recommendations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.roleRecommendations.length > 0 ? (
                    profile.roleRecommendations.map((item) => (
                      <Badge
                        key={item}
                        className="border-[var(--primary-border)] bg-[var(--primary-muted)] text-[var(--primary-light)]"
                      >
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <Badge>Recommendations appear after a few messages.</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
