import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";

export default async function CandidateIntroPage() {
  await requireSession("candidate");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center">
      <Card className="w-full px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex size-18 items-center justify-center rounded-[32px] bg-[#FEF3C7] text-[#B45309]">
          <Bot className="size-8" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#4F46E5]">
          Step 1 of 6
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          I&apos;ll ask you a few questions to build your profile.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
          No formatting needed — just talk to me naturally. I extract structure in
          real time, suggest skills, and help recruiters compare your profile fairly.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <Progress value={16} />
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Conversational",
              description: "Tell your story naturally instead of fighting formatting.",
            },
            {
              icon: ShieldCheck,
              title: "Bias-aware",
              description: "The system focuses on structured evidence instead of document style.",
            },
            {
              icon: Bot,
              title: "Autosaved",
              description: "Every turn persists, and offline updates sync when you reconnect.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-slate-50 p-5 text-left">
              <item.icon className="size-5 text-[#4F46E5]" />
              <p className="mt-4 font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/candidate/builder">
            <Button size="lg" type="button">
              Let&apos;s begin
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
