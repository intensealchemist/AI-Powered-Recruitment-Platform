import { signOutAction } from "@/app/actions/auth";
import { deleteAccountAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireSession();

  const accountFields = [
    { label: "Role",         value: user.role,                                     mono: false },
    { label: "Email",        value: user.email,                                    mono: true  },
    { label: "Verification", value: user.verified ? "Verified" : "Pending",       mono: false },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      {/* Header */}
      <Card className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary-light)]">
          Settings
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-1)] sm:text-3xl">
          Privacy &amp; account controls
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-2)]">
          Manage your account access, demo credentials, and deletion controls from one place.
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Account details */}
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-1)]">Account</h2>
          <div className="space-y-3">
            {accountFields.map(({ label, value, mono }) => (
              <div
                key={label}
                className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] px-4 py-3.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-4)]">
                  {label}
                </p>
                <p
                  className={`mt-1.5 text-sm font-semibold capitalize text-[var(--text-1)] ${
                    mono ? "font-ai" : ""
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Session + Danger zone */}
        <div className="space-y-5">
          {/* Session */}
          <Card className="p-6">
            <h2 className="mb-3 text-base font-semibold text-[var(--text-1)]">Session</h2>
            <p className="text-sm leading-relaxed text-[var(--text-2)]">
              Sign out safely on shared devices or after reviewing the seeded demo flows.
            </p>
            <form action={signOutAction} className="mt-5">
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </Card>

          {/* Danger zone */}
          <Card className="border-rose-500/20 bg-rose-500/[0.05] p-6">
            <h2 className="mb-1 text-base font-semibold text-rose-400">Delete account</h2>
            <p className="text-sm leading-relaxed text-[var(--text-2)]">
              Removes your account, structured profile data, shortlist records, and shareable&#8209;link
              access from the current environment. This action cannot be undone.
            </p>
            <form action={deleteAccountAction} className="mt-5">
              <Button type="submit" variant="destructive">
                Delete my account
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
