"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BriefcaseBusiness, User2, Settings, LogOut, LayoutDashboard, Sparkles, FileText } from "lucide-react";
import { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";

export function UserDropdown({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navItems = user.role === "recruiter" 
    ? [
        { href: "/recruiter", label: "Dashboard", icon: LayoutDashboard },
        { href: "/recruiter/shortlist", label: "Shortlisted", icon: BriefcaseBusiness },
        { href: "/settings", label: "Account Settings", icon: Settings },
      ]
    : [
        { href: "/candidate/intro", label: "Profile Builder", icon: Sparkles },
        { href: "/candidate/review", label: "Review Profile", icon: FileText },
        { href: "/settings", label: "Account Settings", icon: Settings },
      ];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm transition hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-[11px] font-bold",
            user.role === "recruiter"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--ai)] text-slate-950",
          )}
        >
          {initials ?? (
            user.role === "recruiter"
              ? <BriefcaseBusiness className="size-3.5" />
              : <User2 className="size-3.5" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-semibold text-[var(--text-1)] leading-none">
            {user.name}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-3)] leading-none capitalize">
            {user.designation || user.role}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-white/[0.1] bg-[#0E1023] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
          
          <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
            <p className="text-[13px] font-semibold text-[var(--text-1)]">{user.name}</p>
            <p className="text-[11px] text-[var(--text-3)] truncate leading-tight pt-1">{user.email}</p>
          </div>

          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium text-[var(--text-2)] transition hover:bg-white/[0.06] hover:text-[var(--text-1)]"
              >
                <item.icon className="size-4 opacity-70" />
                {item.label}
              </Link>
            ))}
            
            <div className="my-1.5 h-px w-full bg-white/[0.06]" />
            
            <form action={signOutAction} className="w-full">
              <button 
                type="submit"
                className="flex w-full justify-between items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                Sign out
                <LogOut className="size-4 opacity-70" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
