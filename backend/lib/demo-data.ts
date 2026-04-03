import { calculateCompletionScore } from "./profile";
import { CandidateProfile, SessionUser } from "./types";

const now = new Date().toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// Demo accounts — seeded into Turso via `npm run db:seed`
// These are NOT used as an in-memory fallback anymore.
// ─────────────────────────────────────────────────────────────────────────────

export const demoUsers: SessionUser[] = [
  {
    id: "user-demo-candidate",
    name: "Anshu",
    email: "hire-me@anshumat.org",
    password: "HireMe@2025!",
    role: "candidate",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Anshu",
    demo: true,
    verified: true,
  },
  {
    id: "user-demo-recruiter",
    name: "Recruiter",
    email: "hire-me+recruiter@anshumat.org",
    password: "HireMe@2025!",
    role: "recruiter",
    company: "TalentFlow",
    designation: "Talent Partner",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Recruiter",
    demo: true,
    verified: true,
  },
];

const baseProfile: CandidateProfile = {
  id: "profile-demo-candidate",
  userId: "user-demo-candidate",
  name: "Anshu",
  email: "hire-me@anshumat.org",
  headline: "",
  summary: "",
  aiSummary: "",
  roleRecommendations: [],
  completionScore: 0,
  visibility: "public",
  shareToken: "2f79669c-17b4-4ca0-8b48-c5f9e61c2510",
  publishedAt: now,
  pdfVersionHash: "demo-v1",
  lastEditedDeviceId: "seed-device",
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

export const demoProfiles: CandidateProfile[] = [
  { ...baseProfile, completionScore: calculateCompletionScore(baseProfile) },
];

// No shortlists seeded — recruiter starts fresh
export const demoShortlists = [] as const;
