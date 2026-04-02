export type UserRole = "candidate" | "recruiter";

export type ProfileVisibility = "public" | "private";

export type SkillProficiency = "beginner" | "intermediate" | "advanced";

export type SkillSource = "ai_suggested" | "user_added";

export type ShortlistStage =
  | "viewed"
  | "shortlisted"
  | "under_review"
  | "rejected";

export type ConversationMessageRole = "assistant" | "user";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  company?: string;
  designation?: string;
  image?: string;
  demo?: boolean;
  verified: boolean;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  current: boolean;
  description: string;
  structuredPoints: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: SkillProficiency;
  source: SkillSource;
  confirmed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  duration?: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  year?: number;
}

export interface ConversationMessage {
  role: ConversationMessageRole;
  content: string;
  createdAt: string;
}

export interface AIConversationLog {
  sessionId: string;
  createdAt: string;
  messages: ConversationMessage[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  headline: string;
  summary: string;
  aiSummary: string;
  roleRecommendations: string[];
  completionScore: number;
  visibility: ProfileVisibility;
  shareToken: string;
  publishedAt?: string | null;
  pdfVersionHash: string;
  lastEditedDeviceId?: string | null;
  lastConflictAt?: string | null;
  availability: string;
  headlineSource: "ai" | "manual";
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  education: Education[];
  conversationLogs: AIConversationLog[];
  updatedAt: string;
}

export interface ShortlistRecord {
  id: string;
  recruiterId: string;
  candidateId: string;
  stage: ShortlistStage;
  notes?: string;
  addedAt: string;
}

export interface CandidateCardData {
  candidateId: string;
  name: string;
  email: string;
  headline: string;
  summary: string;
  skills: Skill[];
  experienceYears: number;
  matchScore: number;
  completionScore: number;
  availability: string;
  stage: ShortlistStage;
  profile: CandidateProfile;
}

export interface AuthActionState {
  error?: string;
}

export interface AiTurnResult {
  assistantMessage: string;
  profile: CandidateProfile;
  mode: "ai" | "manual";
  suggestions: string[];
}

export interface ManualProfileFallbackInput {
  headline: string;
  summary: string;
  company: string;
  title: string;
}

export interface CandidateFilters {
  skills: string[];
  experienceRange: [number, number];
  availability: string[];
  sortBy: "match" | "recency" | "completeness";
  view: "table" | "card";
}
