import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { demoProfiles, demoShortlists, demoUsers } from "@/lib/demo-data";
import { calculateCompletionScore, computeMatchScore, getExperienceYears } from "@/lib/profile";
import { getDb, hasTursoConfig } from "@/lib/db";
import { users as usersTable, profiles as profilesTable, shortlists as shortlistsTable } from "@/lib/db/schema";
import {
  AIConversationLog,
  CandidateCardData,
  CandidateProfile,
  ConversationMessage,
  Education,
  Experience,
  Project,
  SessionUser,
  ShortlistRecord,
  ShortlistStage,
  Skill,
} from "@/lib/types";

interface InMemoryStore {
  users: SessionUser[];
  profiles: CandidateProfile[];
  shortlists: ShortlistRecord[];
}

declare global {
  var __talentFlowStore: InMemoryStore | undefined;
}

function deepClone<T>(value: T) {
  return structuredClone(value);
}

function getStore() {
  if (!globalThis.__talentFlowStore) {
    globalThis.__talentFlowStore = {
      users: deepClone(demoUsers),
      profiles: deepClone(demoProfiles),
      shortlists: deepClone(demoShortlists),
    };
  }

  return globalThis.__talentFlowStore;
}

function createBlankProfile(user: SessionUser): CandidateProfile {
  const now = new Date().toISOString();

  return {
    id: `profile-${randomUUID()}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    headline: "",
    summary: "",
    aiSummary: "",
    roleRecommendations: [],
    completionScore: 0,
    visibility: "private",
    shareToken: randomUUID(),
    publishedAt: null,
    pdfVersionHash: "draft",
    lastEditedDeviceId: null,
    lastConflictAt: null,
    availability: "Open to opportunities",
    headlineSource: "ai",
    experiences: [],
    skills: [],
    projects: [],
    education: [],
    conversationLogs: [],
    updatedAt: now,
  };
}

function normaliseProfile(profile: CandidateProfile) {
  const nextProfile = {
    ...profile,
    completionScore: calculateCompletionScore(profile),
    pdfVersionHash: `${profile.id}-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };

  return nextProfile;
}

// --------------------------------------------------------------------------
// Turso DB helpers
// --------------------------------------------------------------------------

function dbRowToProfile(row: typeof profilesTable.$inferSelect): CandidateProfile {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    headline: row.headline ?? "",
    summary: row.summary ?? "",
    aiSummary: row.aiSummary ?? "",
    roleRecommendations: (row.roleRecommendations as string[]) ?? [],
    completionScore: row.completionScore ?? 0,
    visibility: (row.visibility as "public" | "private") ?? "private",
    shareToken: row.shareToken,
    publishedAt: row.publishedAt ?? null,
    pdfVersionHash: row.pdfVersionHash,
    lastEditedDeviceId: row.lastEditedDeviceId ?? null,
    lastConflictAt: row.lastConflictAt ?? null,
    availability: row.availability ?? "Open to opportunities",
    headlineSource: (row.headlineSource as "ai" | "manual") ?? "ai",
    experiences: (row.experiences as Experience[]) ?? [],
    skills: (row.skills as Skill[]) ?? [],
    projects: (row.projects as Project[]) ?? [],
    education: (row.education as Education[]) ?? [],
    conversationLogs: (row.conversationLogs as AIConversationLog[]) ?? [],
    updatedAt: row.updatedAt,
  };
}

function dbRowToUser(row: typeof usersTable.$inferSelect): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password ?? undefined,
    role: row.role as SessionUser["role"],
    company: row.company ?? undefined,
    designation: row.designation ?? undefined,
    image: row.image ?? undefined,
    demo: row.demo ?? false,
    verified: row.verified ?? false,
  };
}

function dbRowToShortlist(row: typeof shortlistsTable.$inferSelect): ShortlistRecord {
  return {
    id: row.id,
    recruiterId: row.recruiterId,
    candidateId: row.candidateId,
    stage: row.stage as ShortlistStage,
    notes: row.notes ?? undefined,
    addedAt: row.addedAt,
  };
}

async function listTursoProfiles(): Promise<CandidateProfile[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db.select().from(profilesTable).orderBy(profilesTable.updatedAt);
    return rows.map(dbRowToProfile).map(normaliseProfile);
  } catch {
    return null;
  }
}

async function writeTursoProfile(profile: CandidateProfile): Promise<CandidateProfile | null> {
  const db = getDb();
  if (!db) return null;
  const payload = normaliseProfile(profile);
  try {
    await db
      .insert(profilesTable)
      .values({
        id: payload.id,
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        headline: payload.headline,
        summary: payload.summary,
        aiSummary: payload.aiSummary,
        roleRecommendations: payload.roleRecommendations,
        completionScore: payload.completionScore,
        visibility: payload.visibility,
        shareToken: payload.shareToken,
        publishedAt: payload.publishedAt ?? undefined,
        pdfVersionHash: payload.pdfVersionHash,
        lastEditedDeviceId: payload.lastEditedDeviceId ?? undefined,
        lastConflictAt: payload.lastConflictAt ?? undefined,
        availability: payload.availability,
        headlineSource: payload.headlineSource,
        experiences: payload.experiences,
        skills: payload.skills,
        projects: payload.projects,
        education: payload.education,
        conversationLogs: payload.conversationLogs,
        updatedAt: payload.updatedAt,
      })
      .onConflictDoUpdate({
        target: profilesTable.id,
        set: {
          name: payload.name,
          email: payload.email,
          headline: payload.headline,
          summary: payload.summary,
          aiSummary: payload.aiSummary,
          roleRecommendations: payload.roleRecommendations,
          completionScore: payload.completionScore,
          visibility: payload.visibility,
          shareToken: payload.shareToken,
          publishedAt: payload.publishedAt ?? undefined,
          pdfVersionHash: payload.pdfVersionHash,
          lastEditedDeviceId: payload.lastEditedDeviceId ?? undefined,
          lastConflictAt: payload.lastConflictAt ?? undefined,
          availability: payload.availability,
          headlineSource: payload.headlineSource,
          experiences: payload.experiences,
          skills: payload.skills,
          projects: payload.projects,
          education: payload.education,
          conversationLogs: payload.conversationLogs,
          updatedAt: payload.updatedAt,
        },
      });
    return payload;
  } catch {
    return null;
  }
}

async function listTursoShortlists(): Promise<ShortlistRecord[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db.select().from(shortlistsTable);
    return rows.map(dbRowToShortlist);
  } catch {
    return null;
  }
}

async function writeTursoShortlist(record: ShortlistRecord): Promise<ShortlistRecord | null> {
  const db = getDb();
  if (!db) return null;
  try {
    await db
      .insert(shortlistsTable)
      .values({
        id: record.id,
        recruiterId: record.recruiterId,
        candidateId: record.candidateId,
        stage: record.stage,
        notes: record.notes,
        addedAt: record.addedAt,
      })
      .onConflictDoUpdate({
        target: shortlistsTable.id,
        set: {
          stage: record.stage,
          notes: record.notes,
        },
      });
    return record;
  } catch {
    return null;
  }
}

async function listTursoUsers(): Promise<SessionUser[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const rows = await db.select().from(usersTable);
    return rows.map(dbRowToUser);
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

function buildCandidateCards(
  profiles: CandidateProfile[],
  shortlists: ShortlistRecord[],
): CandidateCardData[] {
  return profiles.map((profile) => {
    const shortlist = shortlists.find((item) => item.candidateId === profile.userId);

    return {
      candidateId: profile.userId,
      name: profile.name,
      email: profile.email,
      headline: profile.headline,
      summary: profile.aiSummary || profile.summary,
      skills: profile.skills,
      experienceYears: getExperienceYears(profile),
      matchScore: computeMatchScore(profile),
      completionScore: profile.completionScore,
      availability: profile.availability,
      stage: shortlist?.stage ?? "viewed",
      profile,
    };
  });
}

export async function getUserByEmail(email: string) {
  if (hasTursoConfig()) {
    const tursoUsers = await listTursoUsers();
    const match = tursoUsers?.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (match) return match;
  }

  return getStore().users.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUserById(userId: string) {
  if (hasTursoConfig()) {
    const tursoUsers = await listTursoUsers();
    const match = tursoUsers?.find((item) => item.id === userId);
    if (match) return match;
  }

  return getStore().users.find((item) => item.id === userId) ?? null;
}

export async function authenticateUser(email: string, password: string, roleHint?: string) {
  if (hasTursoConfig()) {
    const db = getDb();
    if (db) {
      try {
        const rows = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email.toLowerCase()));
        // If there are multiple rows (dual-role demo), pick by roleHint
        const row = roleHint
          ? (rows.find((r) => r.role === roleHint && r.password === password) ?? rows.find((r) => r.password === password))
          : rows.find((r) => r.password === password);
        if (row) {
          return dbRowToUser(row);
        }
      } catch {}
    }
  }

  const demoMatch =
    roleHint
      ? (demoUsers.find(
          (item) =>
            item.email.toLowerCase() === email.toLowerCase() &&
            item.password === password &&
            item.role === roleHint,
        ) ??
        demoUsers.find(
          (item) =>
            item.email.toLowerCase() === email.toLowerCase() &&
            item.password === password,
        ))
      : demoUsers.find(
          (item) =>
            item.email.toLowerCase() === email.toLowerCase() &&
            item.password === password,
        );

  if (demoMatch) {
    return demoMatch;
  }

  return (
    getStore().users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    ) ?? null
  );
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: SessionUser["role"];
}) {
  const existing = await getUserByEmail(input.email);

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user: SessionUser = {
    id: `user-${randomUUID()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    verified: input.email === "hire-me@anshumat.org",
    demo: input.email === "hire-me@anshumat.org",
  };

  if (hasTursoConfig()) {
    const db = getDb();
    if (db) {
      await db.insert(usersTable).values({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        verified: user.verified,
        demo: user.demo,
      }).onConflictDoNothing();
    }
  }

  const store = getStore();
  store.users.push(user);

  if (user.role === "candidate") {
    const profile = createBlankProfile(user);
    store.profiles.push(profile);
    await writeTursoProfile(profile);
  }

  return user;
}

export async function getCandidateProfile(userId: string) {
  if (hasTursoConfig()) {
    const db = getDb();
    if (db) {
      try {
        const rows = await db
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.userId, userId));
        if (rows[0]) return normaliseProfile(dbRowToProfile(rows[0]));
      } catch {}
    }
  }

  const store = getStore();
  const profile = store.profiles.find((item) => item.userId === userId);

  if (profile) {
    return deepClone(profile);
  }

  const user = store.users.find((item) => item.id === userId);

  if (!user) {
    return null;
  }

  const created = createBlankProfile(user);
  store.profiles.push(created);

  return deepClone(created);
}

export async function getPublishedProfileByShareToken(shareToken: string) {
  if (hasTursoConfig()) {
    const db = getDb();
    if (db) {
      try {
        const rows = await db
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.shareToken, shareToken));
        const row = rows.find((r) => Boolean(r.publishedAt));
        if (row) return normaliseProfile(dbRowToProfile(row));
      } catch {}
    }
  }

  const profiles = getStore().profiles;
  return (
    profiles.find((item) => item.shareToken === shareToken && Boolean(item.publishedAt)) ?? null
  );
}

export async function listCandidates() {
  const tursoProfiles = hasTursoConfig() ? await listTursoProfiles() : null;
  const tursoShortlists = hasTursoConfig() ? await listTursoShortlists() : null;

  const profiles = tursoProfiles ?? getStore().profiles;
  const shortlists = tursoShortlists ?? getStore().shortlists;

  return buildCandidateCards(profiles, shortlists).sort(
    (left, right) => right.matchScore - left.matchScore,
  );
}

export async function listShortlistsForRecruiter(recruiterId: string) {
  const tursoShortlists = hasTursoConfig() ? await listTursoShortlists() : null;
  const shortlists = tursoShortlists ?? getStore().shortlists;

  return shortlists.filter((item) => item.recruiterId === recruiterId);
}

export async function updateShortlistStage(input: {
  recruiterId: string;
  candidateId: string;
  stage: ShortlistStage;
  notes?: string;
}) {
  const store = getStore();
  const existing = store.shortlists.find(
    (item) =>
      item.recruiterId === input.recruiterId && item.candidateId === input.candidateId,
  );

  if (existing) {
    existing.stage = input.stage;
    existing.notes = input.notes ?? existing.notes;
    await writeTursoShortlist(existing);
    return deepClone(existing);
  }

  const next: ShortlistRecord = {
    id: `shortlist-${randomUUID()}`,
    recruiterId: input.recruiterId,
    candidateId: input.candidateId,
    stage: input.stage,
    notes: input.notes,
    addedAt: new Date().toISOString(),
  };

  store.shortlists.push(next);
  await writeTursoShortlist(next);

  return deepClone(next);
}

export async function saveProfile(profile: CandidateProfile, deviceId?: string) {
  const store = getStore();
  const existing = store.profiles.find((item) => item.userId === profile.userId);
  const prepared = normaliseProfile({
    ...profile,
    lastConflictAt:
      existing &&
      deviceId &&
      existing.lastEditedDeviceId &&
      existing.lastEditedDeviceId !== deviceId
        ? new Date().toISOString()
        : profile.lastConflictAt,
    lastEditedDeviceId: deviceId ?? profile.lastEditedDeviceId,
  });

  if (existing) {
    Object.assign(existing, prepared);
  } else {
    store.profiles.push(prepared);
  }

  await writeTursoProfile(prepared);

  return deepClone(prepared);
}

export async function appendConversation(input: {
  userId: string;
  sessionId: string;
  messages: ConversationMessage[];
  deviceId?: string;
}) {
  const profile = await getCandidateProfile(input.userId);

  if (!profile) {
    throw new Error("Candidate profile not found.");
  }

  const nextLogs = [...profile.conversationLogs];
  const existing = nextLogs.find((item) => item.sessionId === input.sessionId);

  if (existing) {
    existing.messages = [...existing.messages, ...input.messages];
  } else {
    const log: AIConversationLog = {
      sessionId: input.sessionId,
      createdAt: new Date().toISOString(),
      messages: input.messages,
    };
    nextLogs.unshift(log);
  }

  return saveProfile(
    {
      ...profile,
      conversationLogs: nextLogs,
    },
    input.deviceId,
  );
}

export async function updateProfileArrays(input: {
  userId: string;
  experiences?: Experience[];
  skills?: Skill[];
  education?: Education[];
  profile?: Partial<CandidateProfile>;
}) {
  const profile = await getCandidateProfile(input.userId);

  if (!profile) {
    throw new Error("Candidate profile not found.");
  }

  return saveProfile({
    ...profile,
    ...input.profile,
    experiences: input.experiences ?? profile.experiences,
    skills: input.skills ?? profile.skills,
    education: input.education ?? profile.education,
  });
}

export async function publishProfile(userId: string, publish: boolean) {
  const profile = await getCandidateProfile(userId);

  if (!profile) {
    throw new Error("Candidate profile not found.");
  }

  return saveProfile({
    ...profile,
    visibility: publish ? "public" : profile.visibility,
    publishedAt: publish ? new Date().toISOString() : null,
  });
}

export async function regenerateShareToken(userId: string) {
  const profile = await getCandidateProfile(userId);

  if (!profile) {
    throw new Error("Candidate profile not found.");
  }

  return saveProfile({
    ...profile,
    shareToken: randomUUID(),
  });
}

export async function deleteAccount(userId: string) {
  const store = getStore();

  store.users = store.users.filter((item) => item.id !== userId);
  store.profiles = store.profiles.filter((item) => item.userId !== userId);
  store.shortlists = store.shortlists.filter(
    (item) => item.candidateId !== userId && item.recruiterId !== userId,
  );

  if (hasTursoConfig()) {
    const db = getDb();
    if (db) {
      // Delete profile first (foreign key), then user — cascade handles it but be explicit
      await db.delete(profilesTable).where(eq(profilesTable.userId, userId)).catch(() => null);
      await db
        .delete(shortlistsTable)
        .where(eq(shortlistsTable.candidateId, userId))
        .catch(() => null);
      await db
        .delete(shortlistsTable)
        .where(eq(shortlistsTable.recruiterId, userId))
        .catch(() => null);
      await db.delete(usersTable).where(eq(usersTable.id, userId)).catch(() => null);
    }
  }
}

export async function resetProfileData(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile) throw new Error("Candidate profile not found.");

  return saveProfile({
    ...profile,
    headline: "",
    summary: "",
    aiSummary: "",
    experiences: [],
    skills: [],
    conversationLogs: [],
  });
}
