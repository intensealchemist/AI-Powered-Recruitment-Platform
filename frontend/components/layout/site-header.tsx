import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";

const navByRole = {
  candidate: [
    { href: "/candidate/intro",   label: "Builder"  },
    { href: "/candidate/review",  label: "Review"   },
    { href: "/settings",          label: "Settings" },
  ],
  recruiter: [
    { href: "/recruiter",          label: "Candidates" },
    { href: "/recruiter/shortlist", label: "Shortlist"  },
    { href: "/settings",           label: "Settings"   },
  ],
};

export function SiteHeader({
  user,
  pathname,
}: {
  user: SessionUser | null;
  pathname: string;
}) {
  const navItems = user ? navByRole[user.role] : [];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--bg-base)]/75 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href={user?.role === "recruiter" ? "/recruiter" : "/"}
          className="group flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary)] shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow group-hover:shadow-[0_0_28px_rgba(99,102,241,0.56)]">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)] leading-none">
              Talentflow
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--text-1)] leading-none">
              Build your profile, not your resume
            </p>
          </div>
        </Link>

        {/* Nav */}
        {navItems.length > 0 && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "bg-[var(--primary)] text-white shadow-[0_0_16px_rgba(99,102,241,0.32)]"
                      : "text-[var(--text-2)] hover:bg-white/[0.06] hover:text-[var(--text-1)]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right — auth or user */}
        <div className="flex items-center gap-2.5">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-2)] transition hover:text-[var(--text-1)]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.3)] transition hover:bg-[var(--primary-light)] hover:shadow-[0_0_26px_rgba(99,102,241,0.45)] hover:-translate-y-0.5"
              >
                Get started
              </Link>
            </div>
          ) : (
            <UserDropdown user={user} />
          )}
        </div>
      </div>
    </header>
  );
}
