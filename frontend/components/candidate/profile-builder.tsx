"use client";

import { useEffect, useMemo, useState, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Edit3, LoaderCircle, RotateCcw, Send, WifiOff, AlertTriangle, Undo2, Redo2 } from "lucide-react";
import { toast } from "sonner";

import {
  addManualSkillAction,
  confirmSkillAction,
  processConversationAction,
  resetProfileAction,
  restoreProfileAction,
  updateManualProfileFallbackAction,
} from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CandidateProfile, ConversationMessage } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

const queueKey   = "talentflow-offline-queue";
const sessionKey = "talentflow-session-id";
const deviceKey  = "talentflow-device-id";

type Snapshot = {
  profile: CandidateProfile;
  messages: ConversationMessage[];
};

function TypewriterMessage({ content, animate }: { content: string; animate: boolean }) {
  const [displayed, setDisplayed] = useState(animate ? "" : content);

  useEffect(() => {
    if (!animate) {
      setDisplayed(content);
      return;
    }

    let index = 0;
    setDisplayed("");
    
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        const nextChar = content[index];
        index++;
        return nextChar ? prev + nextChar : prev;
      });
      if (index >= content.length) {
        clearInterval(interval);
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [content, animate]);

  return <>{displayed}</>;
}

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
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [manualHeadline, setManualHeadline]   = useState(initialProfile.headline);
  const [manualSummary, setManualSummary]     = useState(initialProfile.summary);
  const [manualCompany, setManualCompany]     = useState(initialProfile.experiences[0]?.company ?? "");
  const [manualTitle, setManualTitle]         = useState(initialProfile.experiences[0]?.title ?? "");
  const [isPending, startTransition]          = useTransition();
  const [isSyncing, setIsSyncing]             = useState(false);
  const [isOnline, setIsOnline]               = useState(true);

  // Use State for Local React Messages to fix DB caching overwrites
  const [liveMessages, setLiveMessages] = useState<ConversationMessage[]>([]);
  const [latestAiMessageId, setLatestAiMessageId] = useState<string | null>(null);

  // Undo / Redo Timeline State
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<{ list: Snapshot[]; index: number }>({ list: [], index: -1 });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const deviceId = useMemo(() => {
    if (typeof window === "undefined") return "server-device";
    const existing = window.localStorage.getItem(deviceKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(deviceKey, next);
    return next;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = window.localStorage.getItem(sessionKey);
      if (existing) {
        setSessionId(existing);
      } else {
        const next = crypto.randomUUID();
        window.localStorage.setItem(sessionKey, next);
        setSessionId(next);
      }
    }
  }, []);

  // Initialize liveMessages & setup first History State based on loaded profile and session
  useEffect(() => {
    if (!sessionId) return;
    const match = initialProfile.conversationLogs.find((item) => item.sessionId === sessionId)?.messages;
    const defaultMessages = match ?? initialProfile.conversationLogs[0]?.messages ?? [];
    
    // Only set if liveMessages is empty
    if (liveMessages.length === 0) {
      setLiveMessages(defaultMessages);
    }
    
    // Auto-populate 0th timeline index
    if (history.length === 0) {
       setHistory([{ profile: initialProfile, messages: defaultMessages }]);
       setHistoryIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, initialProfile]);

  // Keep ref synchronized with state for event listeners
  useEffect(() => {
    historyRef.current = { list: history, index: historyIndex };
  }, [history, historyIndex]);

  // Push new snapshot resolving branching timelines
  const saveSnapshot = useCallback((newProfile: CandidateProfile, newMessages: ConversationMessage[]) => {
    setHistory((prev) => {
      const idx = historyRef.current.index;
      const pruned = prev.slice(0, idx + 1);
      const updated = [...pruned, { profile: newProfile, messages: newMessages }];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, []);

  const handleUndo = useCallback(() => {
    const { list, index } = historyRef.current;
    if (index > 0) {
      const targetIndex = index - 1;
      const targetState = list[targetIndex];
      
      setHistoryIndex(targetIndex);
      setProfile(targetState.profile);
      setLiveMessages(targetState.messages);
      setSaveLabel("Reverted");

      startTransition(async () => {
         await restoreProfileAction(targetState.profile);
      });
    }
  }, []);

  const handleRedo = useCallback(() => {
    const { list, index } = historyRef.current;
    if (index < list.length - 1) {
      const targetIndex = index + 1;
      const targetState = list[targetIndex];
      
      setHistoryIndex(targetIndex);
      setProfile(targetState.profile);
      setLiveMessages(targetState.messages);
      setSaveLabel("Restored");

      startTransition(async () => {
         await restoreProfileAction(targetState.profile);
      });
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Do not intercept if user is typing a message in an input field (let their local OS undo handle text)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
           e.preventDefault();
           handleRedo();
        } else {
           e.preventDefault();
           handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
         e.preventDefault();
         handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Keep chat scrolled visually to the bottom seamlessly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveMessages, isPending]);

  useEffect(() => {
    if (!saveLabel) return;
    const timeout = window.setTimeout(() => setSaveLabel(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [saveLabel]);

  useEffect(() => {
    const syncQueuedMessages = async () => {
      if (!sessionId) return;
      const queued = JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as string[];
      if (queued.length === 0 || !navigator.onLine) return;
      
      setIsSyncing(true);
      for (const item of queued) {
        const tempMsg: ConversationMessage = { role: "user", content: item, createdAt: new Date().toISOString() };
        const updatedHistory = [...liveMessages, tempMsg];
        const result = await processConversationAction({ 
          message: item, 
          sessionId, 
          deviceId,
          chatHistory: updatedHistory,
        });
        const finalMessages = result.profile.conversationLogs.find(l => l.sessionId === sessionId)?.messages ?? [];
        setProfile(result.profile);
        setLiveMessages(finalMessages);
        saveSnapshot(result.profile, finalMessages);
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
  }, [deviceId, sessionId, liveMessages, saveSnapshot]);

  const handleSend = () => {
    if (!message.trim() || !sessionId) return;
    
    const nextMessage = message.trim();
    const messageTimestamp = new Date().toISOString();
    
    const newMessageObj: ConversationMessage = {
      role: "user",
      content: nextMessage,
      createdAt: messageTimestamp
    };

    // Optimistically update UI
    const updatedHistory = [...liveMessages, newMessageObj];
    setLiveMessages(updatedHistory);
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
      try {
        const result = await processConversationAction({ 
          message: nextMessage, 
          sessionId, 
          deviceId,
          chatHistory: updatedHistory 
        });
        
        // Target specifically the newest assistant message for typewriter animation
        const updatedMsgs = result.profile.conversationLogs.find((item) => item.sessionId === sessionId)?.messages ?? [];
        if (updatedMsgs.length > 0) {
           setLatestAiMessageId(updatedMsgs[updatedMsgs.length - 1].createdAt);
        }

        setLiveMessages(updatedMsgs);
        setProfile(result.profile);
        saveSnapshot(result.profile, updatedMsgs);
        setShowManualFallback(result.mode === "manual");
        setManualHeadline(result.profile.headline);
        setManualSummary(result.profile.summary);
        setSaveLabel("Saved just now");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error sending message");
        // Pop the optimistic update on error
        setLiveMessages(liveMessages); 
      }
    });
  };

  const handleConfirmStartOver = () => {
    setShowResetWarning(false);
    startTransition(async () => {
      const reset = await resetProfileAction();
      
      const nextSession = crypto.randomUUID();
      window.localStorage.setItem(sessionKey, nextSession);
      setSessionId(nextSession);
      
      setLiveMessages([]);
      saveSnapshot(reset, []);
      setMessage("");
      setManualHeadline("");
      setManualSummary("");
      setProfile(reset);
      setSaveLabel("Profile reset");
      toast.success("Profile has been completely wiped. You can start fresh!");
    });
  };

  const toggleSkill = (skillId: string, confirmed: boolean) => {
    startTransition(async () => {
      const next = await confirmSkillAction(skillId, confirmed);
      setProfile(next);
      saveSnapshot(next, liveMessages);
      setSaveLabel("Saved just now");
    });
  };

  const addSkill = () => {
    if (!manualSkill.trim()) return;
    startTransition(async () => {
      const next = await addManualSkillAction(manualSkill);
      setProfile(next);
      saveSnapshot(next, liveMessages);
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
      saveSnapshot(next, liveMessages);
      setSaveLabel("Saved just now");
      toast.success("Manual details saved.");
    });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--bg-surface)] shadow-2xl">
      
      {/* Warning Overlay */}
      {showResetWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#161313] p-6 shadow-[0_0_80px_-20px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="rounded-full bg-red-500/10 p-2">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-lg font-bold">Wipe Data & Start Over</h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-300">
              Are you sure you want to start completely from scratch? This will irreversibly delete your AI chat history, mapped skills, structured experience, and auto-generated summary. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowResetWarning(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmStartOver}>
                Yes, wipe everything
              </Button>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center rounded-full bg-white/[0.02] border border-white/[0.06] p-0.5">
                    <button
                      className={`rounded-full p-1.5 transition ${canUndo ? "text-[var(--text-2)] hover:bg-white/[0.08]" : "text-[var(--text-4)] opacity-50 cursor-not-allowed"}`}
                      onClick={handleUndo}
                      disabled={!canUndo}
                      type="button"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="size-3.5" />
                    </button>
                    <button
                      className={`rounded-full p-1.5 transition ${canRedo ? "text-[var(--text-2)] hover:bg-white/[0.08]" : "text-[var(--text-4)] opacity-50 cursor-not-allowed"}`}
                      onClick={handleRedo}
                      disabled={!canRedo}
                      type="button"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="size-3.5" />
                    </button>
                  </div>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-3)] transition hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => setShowResetWarning(true)}
                    type="button"
                  >
                    <RotateCcw className="size-3.5" />
                    Start over
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2 scroll-smooth">
                {/* Initial prompt placeholder */}
                {liveMessages.length === 0 && (
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

                {liveMessages.map((item) => (
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
                        {item.role === "assistant" ? (
                           <TypewriterMessage content={item.content} animate={latestAiMessageId === item.createdAt} />
                        ) : (
                           item.content
                        )}
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
                     disabled={!message.trim() || isPending || !sessionId}
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
