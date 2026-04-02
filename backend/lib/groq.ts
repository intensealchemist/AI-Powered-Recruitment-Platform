import Groq from "groq-sdk";
import { randomUUID } from "node:crypto";

import { saveProfile } from "@/lib/data";
import { CandidateProfile, Experience, Skill } from "@/lib/types";

const fallbackModels = [
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "llama3-70b-8192",
];

async function getGroqApiKey() {
  const loaded = process.env.GROQ_API_KEY?.trim();

  if (loaded) {
    return loaded;
  }

  const { loadEnvConfig } = await import("@next/env");
  loadEnvConfig(process.cwd());

  return process.env.GROQ_API_KEY?.trim() || null;
}

async function createClient() {
  const apiKey = await getGroqApiKey();

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

function inferSkills(text: string) {
  const dictionary = [
    ["react", "React", "Frontend"],
    ["next", "Next.js", "Frontend"],
    ["typescript", "TypeScript", "Frontend"],
    ["javascript", "JavaScript", "Frontend"],
    ["node", "Node.js", "Backend"],
    ["api", "REST APIs", "Backend"],
    ["design", "Design Systems", "Product"],
    ["sql", "SQL", "Data"],
    ["python", "Python", "Backend"],
    ["accessibility", "Accessibility", "Product"],
  ] as const;

  return dictionary
    .filter(([needle]) => text.toLowerCase().includes(needle))
    .map(([, label, category]) => ({
      id: `skill-${randomUUID()}`,
      name: label,
      category,
      proficiency: "intermediate" as const,
      source: "ai_suggested" as const,
      confirmed: false,
    }));
}

function heuristicResult(text: string, profile: CandidateProfile) {
  const skills = inferSkills(text).filter(
    (suggestion) =>
      !profile.skills.some(
        (existing) => existing.name.toLowerCase() === suggestion.name.toLowerCase(),
      ),
  );

  const firstSentence = text.split(/[.!?]/)[0]?.trim() || text;
  const experience: Experience = {
    id: `exp-${randomUUID()}`,
    company: text.toLowerCase().includes("freelance")
      ? "Freelance / Independent"
      : "New role",
    title: text.toLowerCase().includes("designer")
      ? "Designer"
      : text.toLowerCase().includes("developer")
        ? "Developer"
        : "Contributor",
    startDate: undefined,
    endDate: undefined,
    current: true,
    description: text,
    structuredPoints: [
      firstSentence,
      "Follow-up needed to capture the most measurable achievement from this work.",
    ],
  };

  const nextExperiences =
    profile.experiences.length === 0 ? [experience] : profile.experiences;
  const nextSkills = [...profile.skills, ...skills];
  const summary =
    profile.summary ||
    `${profile.name || "This candidate"} has been working on ${firstSentence.toLowerCase()}.`;

  return {
    assistantMessage:
      skills.length > 0
        ? `I captured the core of that and suggested a few likely skills. I also added a draft role entry on the right so you can refine it. What was the most impactful thing you achieved there?`
        : `I captured that context. What was the most impactful thing you achieved there, and did you quantify the result in any way?`,
    profile: {
      ...profile,
      headline:
        profile.headline ||
        "AI-assisted profile in progress",
      summary,
      aiSummary:
        profile.aiSummary ||
        `${profile.name} is building a structured profile from conversational inputs.`,
      experiences: nextExperiences,
      skills: nextSkills,
    },
    suggestions: skills.map((item) => item.name),
    mode: "manual" as const,
  };
}

export async function processAiTurn(input: {
  message: string;
  profile: CandidateProfile;
  localeHint?: string;
  deviceId?: string;
}) {
  const client = await createClient();
  const fallback = heuristicResult(input.message, input.profile);

  if (!client) {
    const saved = await saveProfile(fallback.profile, input.deviceId);
    return {
      ...fallback,
      profile: saved,
    };
  }

  const systemPrompt = `You are the AI interviewer for a recruitment platform. Convert natural language into structured profile updates. Respond only with valid JSON matching this TypeScript shape:
{
  "assistantMessage": string,
  "headline": string,
  "summary": string,
  "aiSummary": string,
  "roleRecommendations": string[],
  "skills": Array<{ "name": string, "category": string, "proficiency": "beginner" | "intermediate" | "advanced" }>,
  "experiences": Array<{ "company": string, "title": string, "description": string, "current": boolean, "startDate": string | null, "endDate": string | null, "structuredPoints": string[] }>
}
Rules:
- Ask one clarifying or depth-probing follow-up in assistantMessage.
- Handle career gaps, freelance work, first-time candidates, and vague descriptions gracefully.
- Suggest likely skills without overstating confidence.
- Write in the user's language when obvious from their message.
- Keep summaries recruiter-ready and unbiased.
- Never mention resume uploads.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: JSON.stringify({
        localeHint: input.localeHint ?? "auto",
        message: input.message,
        profile: {
          headline: input.profile.headline,
          summary: input.profile.summary,
          aiSummary: input.profile.aiSummary,
          experiences: input.profile.experiences,
          skills: input.profile.skills.map((item) => ({
            name: item.name,
            category: item.category,
            proficiency: item.proficiency,
          })),
        },
      }),
    },
  ];

  for (const model of fallbackModels) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages,
      });

      const raw = completion.choices[0]?.message?.content;

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as {
        assistantMessage: string;
        headline?: string;
        summary?: string;
        aiSummary?: string;
        roleRecommendations?: string[];
        skills?: Array<Pick<Skill, "name" | "category" | "proficiency">>;
        experiences?: Array<{
          company: string;
          title: string;
          description: string;
          current: boolean;
          startDate: string | null;
          endDate: string | null;
          structuredPoints: string[];
        }>;
      };

      const mergedSkills: Skill[] = [
        ...input.profile.skills,
        ...(parsed.skills ?? [])
          .filter(
            (skill) =>
              !input.profile.skills.some(
                (existing) =>
                  existing.name.toLowerCase() === skill.name.toLowerCase(),
              ),
          )
          .map((skill) => ({
            id: `skill-${randomUUID()}`,
            name: skill.name,
            category: skill.category,
            proficiency: skill.proficiency,
            source: "ai_suggested" as const,
            confirmed: false,
          })),
      ];

      const mergedExperiences =
        parsed.experiences && parsed.experiences.length > 0
          ? parsed.experiences.map((experience) => ({
              id: `exp-${randomUUID()}`,
              ...experience,
            }))
          : input.profile.experiences;

      const saved = await saveProfile(
        {
          ...input.profile,
          headline: parsed.headline || input.profile.headline,
          summary: parsed.summary || input.profile.summary,
          aiSummary: parsed.aiSummary || input.profile.aiSummary,
          roleRecommendations:
            parsed.roleRecommendations?.length
              ? parsed.roleRecommendations
              : input.profile.roleRecommendations,
          experiences: mergedExperiences,
          skills: mergedSkills,
        },
        input.deviceId,
      );

      return {
        assistantMessage: parsed.assistantMessage,
        profile: saved,
        suggestions: mergedSkills
          .filter((item) => !item.confirmed)
          .map((item) => item.name),
        mode: "ai" as const,
      };
    } catch {
      continue;
    }
  }

  const saved = await saveProfile(fallback.profile, input.deviceId);

  return {
    ...fallback,
    profile: saved,
  };
}
