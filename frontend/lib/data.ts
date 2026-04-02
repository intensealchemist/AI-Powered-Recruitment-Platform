import { randomUUID } from "node:crypto";

import { demoProfiles, demoShortlists, demoUsers } from "@/lib/demo-data";
import { calculateCompletionScore, computeMatchScore, getExperienceYears } from "@/lib/profile";
import {
  PB_COLLECTIONS,
  createPocketBaseAdminClient,
  createPocketBaseClient,
  hasPocketBaseConfig,
} from "@/lib/pocketbase";
import {
  AIConversationLog,
  CandidateCardData,
  CandidateProfile,
  ConversationMessage,
  Education,
  Experience,
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

async function listPocketBaseProfiles() {
  const client = await createPocketBaseAdminClient();

  if (!client) {
    return null;
  }

  const profiles = await client
    .collection(PB_COLLECTIONS.profiles)
    .getFullList<CandidateProfile>({
      sort: "-updated",
    });

  return profiles.map((item) => normaliseProfile(item));
}

async function writePocketBaseProfile(profile: CandidateProfile) {
  const client = await createPocketBaseAdminClient();

  if (!client) {
    return null;
  }

  const payload = normaliseProfile(profile);

  try {
    await client.collection(PB_COLLECTIONS.profiles).update(payload.id, payload);
  } catch {
    await client.collection(PB_COLLECTIONS.profiles).create(payload);
  }

  return payload;
}

async function listPocketBaseShortlists() {
  const client = await createPocketBaseAdminClient();

  if (!client) {
    return null;
  }

  return client.collection(PB_COLLECTIONS.shortlists).getFullList<ShortlistRecord>({
    sort: "-updated",
  });
}

async function writePocketBaseShortlist(record: ShortlistRecord) {
  const client = await createPocketBaseAdminClient();

  if (!client) {
    return null;
  }

  try {
    await client.collection(PB_COLLECTIONS.shortlists).update(record.id, record);
  } catch {
    await client.collection(PB_COLLECTIONS.shortlists).create(record);
  }

  return record;
}

async function listPocketBaseUsers() {
  const client = await createPocketBaseAdminClient();

  if (!client) {
    return null;
  }

  const users = await client.collection(PB_COLLECTIONS.users).getFullList<SessionUser>({
    sort: "-created",
  });

  return users;
}

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
  if (hasPocketBaseConfig()) {
    const users = await listPocketBaseUsers();
    const match = users?.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (match) {
      return match;
    }
  }

  return getStore().users.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUserById(userId: string) {
  if (hasPocketBaseConfig()) {
    const users = await listPocketBaseUsers();
    const match = users?.find((item) => item.id === userId);

    if (match) {
      return match;
    }
  }

  return getStore().users.find((item) => item.id === userId) ?? null;
}

export async function authenticateUser(email: string, password: string) {
  if (hasPocketBaseConfig()) {
    try {
      const client = createPocketBaseClient();

      if (client) {
        const response = await client
          .collection(PB_COLLECTIONS.users)
          .authWithPassword<SessionUser>(email, password);

        return response.record;
      }
    } catch {}
  }

  const demoMatch = demoUsers.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() && item.password === password,
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

  if (hasPocketBaseConfig()) {
    const client = await createPocketBaseAdminClient();

    if (client) {
      await client.collection(PB_COLLECTIONS.users).create({
        ...user,
        password: input.password,
        passwordConfirm: input.password,
      });
    }
  }

  const store = getStore();
  store.users.push(user);

  if (user.role === "candidate") {
    const profile = createBlankProfile(user);
    store.profiles.push(profile);
    await writePocketBaseProfile(profile);
  }

  return user;
}

export async function getCandidateProfile(userId: string) {
  if (hasPocketBaseConfig()) {
    const profiles = await listPocketBaseProfiles();
    const match = profiles?.find((item) => item.userId === userId);

    if (match) {
      return match;
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
  const profiles = hasPocketBaseConfig()
    ? (await listPocketBaseProfiles()) ?? getStore().profiles
    : getStore().profiles;

  return (
    profiles?.find(
      (item) => item.shareToken === shareToken && Boolean(item.publishedAt),
    ) ?? null
  );
}

export async function listCandidates() {
  const profiles = hasPocketBaseConfig()
    ? (await listPocketBaseProfiles()) ?? getStore().profiles
    : getStore().profiles;
  const shortlists = hasPocketBaseConfig()
    ? (await listPocketBaseShortlists()) ?? getStore().shortlists
    : getStore().shortlists;

  return buildCandidateCards(profiles, shortlists).sort(
    (left, right) => right.matchScore - left.matchScore,
  );
}

export async function listShortlistsForRecruiter(recruiterId: string) {
  const shortlists = hasPocketBaseConfig()
    ? (await listPocketBaseShortlists()) ?? getStore().shortlists
    : getStore().shortlists;

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
    await writePocketBaseShortlist(existing);
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
  await writePocketBaseShortlist(next);

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

  await writePocketBaseProfile(prepared);

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

  if (hasPocketBaseConfig()) {
    const client = await createPocketBaseAdminClient();

    if (client) {
      await client.collection(PB_COLLECTIONS.users).delete(userId).catch(() => null);
      const profile = await client
        .collection(PB_COLLECTIONS.profiles)
        .getFirstListItem<CandidateProfile>(`userId="${userId}"`)
        .catch(() => null);

      if (profile?.id) {
        await client.collection(PB_COLLECTIONS.profiles).delete(profile.id).catch(() => null);
      }
    }
  }
}
