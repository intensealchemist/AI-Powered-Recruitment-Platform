"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";

import { signInAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthActionState } from "@/lib/types";

interface AuthCardProps {
  mode: "sign-in" | "sign-up";
}

const initialState: AuthActionState = {};

const GoogleIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon = () => (
  <svg
    className="size-4 text-[var(--text-2)]"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export function AuthCard({ mode }: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    mode === "sign-in" ? signInAction : signUpAction,
    initialState,
  );

  const isDemo = email.trim().toLowerCase() === "hire-me@anshumat.org";
  const title = useMemo(
    () =>
      mode === "sign-in"
        ? "Welcome back"
        : "Create your account",
    [mode],
  );
  const subtitle = useMemo(
    () =>
      mode === "sign-in"
        ? "No resume upload required — just conversation."
        : "Build a structured profile through natural conversation.",
    [mode],
  );

  return (
    /* Full-page centering happens in the page wrapper */
    <div className="relative mx-auto w-full max-w-md">
      {/* Glow behind card */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[32px] bg-[var(--primary-muted)] blur-3xl opacity-60"
      />

      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--bg-surface)]/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-10">
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-[16px] bg-[var(--primary)] shadow-[0_0_24px_rgba(99,102,241,0.45)]">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-1)]">{title}</h1>
            <p className="mt-1.5 text-sm text-[var(--text-2)]">{subtitle}</p>
          </div>
        </div>

        {/* Social auth */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link href="/api/oauth/google" className="block">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[var(--text-1)] transition hover:bg-white/[0.08] hover:border-white/[0.18] active:scale-[0.97]"
            >
              <GoogleIcon />
              Google
            </button>
          </Link>
          <Link href="/api/oauth/github" className="block">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-[var(--text-1)] transition hover:bg-white/[0.08] hover:border-white/[0.18] active:scale-[0.97]"
            >
              <GithubIcon />
              GitHub
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-3)]">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          {mode === "sign-up" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]" htmlFor="name">
                Full name
              </label>
              <Input id="name" name="name" placeholder="Ada Lovelace" autoComplete="name" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isDemo ? "Try HireMe@2025!" : "Enter a secure password"}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--text-3)] transition hover:text-[var(--text-2)]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {mode === "sign-up" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]" htmlFor="role">
                I am joining as
              </label>
              <select
                id="role"
                name="role"
                defaultValue="candidate"
                className="h-11 w-full rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[var(--text-1)] outline-none transition focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)]"
              >
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          )}

          {/* Demo hint */}
          {isDemo && (
            <div className="rounded-[12px] border border-[var(--ai-border)] bg-[var(--ai-muted)] px-4 py-3 text-sm text-amber-300">
              <span className="font-semibold">Demo account detected.</span> Use password{" "}
              <span className="font-ai font-semibold">HireMe@2025!</span>
            </div>
          )}

          {/* Error */}
          {state.error && (
            <div className="rounded-[12px] border border-[var(--error-border)] bg-[var(--error-muted)] px-4 py-3 text-sm text-rose-400">
              {state.error}
            </div>
          )}

          <Button className="mt-2 w-full" disabled={pending} type="submit" size="lg">
            <Mail className="size-4" />
            {pending
              ? "Working…"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-3)]">
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-semibold text-[var(--primary-light)] hover:text-white transition-colors"
          >
            {mode === "sign-in" ? "Sign up free" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
