"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, requireSession } from "@/lib/auth";
import {
  appendConversation,
  deleteAccount,
  getCandidateProfile,
  publishProfile,
  regenerateShareToken,
  saveProfile,
  updateProfileArrays,
  updateShortlistStage,
} from "@/lib/data";
import { processAiTurn } from "@/lib/groq";
import { calculateCompletionScore } from "@/lib/profile";
import { ManualProfileFallbackInput, ShortlistStage } from "@/lib/types";
import { headers } from "next/headers";
import { aiLimiter } from "@/lib/rate-limit";

export async function processConversationAction(input: {
  message: string;
  sessionId: string;
  deviceId: string;
}) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await aiLimiter.limit(ip);

  if (!success) {
    throw new Error("You are generating responses too quickly. Please wait a few seconds.");
  }
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  const messageTimestamp = new Date().toISOString();

  await appendConversation({
    userId: user.id,
    sessionId: input.sessionId,
    deviceId: input.deviceId,
    messages: [
      {
        role: "user",
        content: input.message,
        createdAt: messageTimestamp,
      },
    ],
  });

  const result = await processAiTurn({
    message: input.message,
    profile,
    deviceId: input.deviceId,
  });

  const saved = await appendConversation({
    userId: user.id,
    sessionId: input.sessionId,
    deviceId: input.deviceId,
    messages: [
      {
        role: "assistant",
        content: result.assistantMessage,
        createdAt: new Date().toISOString(),
      },
    ],
  });

  revalidatePath("/candidate/builder");
  revalidatePath("/candidate/review");
  revalidatePath("/recruiter");

  return {
    ...result,
    profile: saved,
  };
}

export async function confirmSkillAction(skillId: string, confirmed: boolean) {
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  const nextSkills = profile.skills.map((skill) =>
    skill.id === skillId ? { ...skill, confirmed } : skill,
  );

  const saved = await updateProfileArrays({
    userId: user.id,
    skills: nextSkills,
  });

  revalidatePath("/candidate/builder");
  revalidatePath("/candidate/review");

  return saved;
}

export async function addManualSkillAction(name: string) {
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  if (!name.trim()) {
    return profile;
  }

  const nextSkills = [
    ...profile.skills,
    {
      id: `skill-${crypto.randomUUID()}`,
      name: name.trim(),
      category: "Custom",
      proficiency: "intermediate" as const,
      source: "user_added" as const,
      confirmed: true,
    },
  ];

  const saved = await updateProfileArrays({
    userId: user.id,
    skills: nextSkills,
  });

  revalidatePath("/candidate/builder");
  revalidatePath("/candidate/review");

  return saved;
}

export async function publishProfileAction() {
  const user = await requireSession("candidate");
  const profile = await publishProfile(user.id, true);

  revalidatePath("/candidate/review");
  revalidatePath(`/p/${profile.shareToken}`);

  return profile;
}

export async function saveDraftAction() {
  const user = await requireSession("candidate");
  const profile = await publishProfile(user.id, false);

  revalidatePath("/candidate/review");

  return profile;
}

export async function regenerateShareTokenAction() {
  const user = await requireSession("candidate");
  const previous = await getCandidateProfile(user.id);
  const profile = await regenerateShareToken(user.id);

  revalidatePath("/candidate/review");

  if (previous?.shareToken) {
    revalidatePath(`/p/${previous.shareToken}`);
  }

  revalidatePath(`/p/${profile.shareToken}`);

  return profile;
}

export async function updateManualProfileFallbackAction(input: ManualProfileFallbackInput) {
  const user = await requireSession("candidate");
  const profile = await getCandidateProfile(user.id);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  const nextExperiences = [...profile.experiences];

  if (input.company || input.title) {
    nextExperiences[0] = {
      id: nextExperiences[0]?.id ?? `exp-${crypto.randomUUID()}`,
      company: input.company || nextExperiences[0]?.company || "Independent work",
      title: input.title || nextExperiences[0]?.title || "Contributor",
      startDate: nextExperiences[0]?.startDate,
      endDate: nextExperiences[0]?.endDate,
      current: true,
      description:
        nextExperiences[0]?.description ||
        "Added through manual fallback while AI service is temporarily unavailable.",
      structuredPoints:
        nextExperiences[0]?.structuredPoints ?? [
          "Manual draft entry saved while AI service is unavailable.",
        ],
    };
  }

  const saved = await saveProfile({
    ...profile,
    headline: input.headline || profile.headline,
    summary: input.summary || profile.summary,
    aiSummary: input.summary || profile.aiSummary,
    experiences: nextExperiences,
  });

  revalidatePath("/candidate/builder");
  revalidatePath("/candidate/review");

  return {
    ...saved,
    completionScore: calculateCompletionScore(saved),
  };
}

export async function updateShortlistStageAction(input: {
  candidateId: string;
  stage: ShortlistStage;
  notes?: string;
}) {
  const user = await requireSession("recruiter");
  const record = await updateShortlistStage({
    recruiterId: user.id,
    candidateId: input.candidateId,
    stage: input.stage,
    notes: input.notes,
  });

  revalidatePath("/recruiter");
  revalidatePath("/recruiter/shortlist");
  revalidatePath(`/recruiter/candidates/${input.candidateId}`);

  return record;
}

export async function deleteAccountAction() {
  const user = await requireSession();
  await deleteAccount(user.id);
  await clearSession();
  revalidatePath("/");
  redirect("/");
}
