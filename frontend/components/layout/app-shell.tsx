"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { SessionUser } from "@/lib/types";

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser | null;
}) {
  const pathname = usePathname();

  return (
    <AppProviders>
      {/* Animated mesh gradient background — fixed, behind everything */}
      <div className="mesh-bg pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <div
        className={[
          "relative z-10 flex flex-col text-[var(--text-1)]",
          pathname === "/candidate/builder" ? "h-screen overflow-hidden" : "min-h-screen",
        ].join(" ")}
      >
        <SiteHeader pathname={pathname} user={user} />
        <main
          className={[
            "mx-auto flex w-full flex-1 flex-col",
            pathname === "/candidate/builder"
              ? "max-w-[1920px] overflow-hidden p-4 sm:p-6 lg:px-8 lg:py-6"
              : "max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          ].join(" ")}
        >
          {children}
        </main>
      </div>
    </AppProviders>
  );
}
