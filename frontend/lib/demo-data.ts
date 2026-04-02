import { calculateCompletionScore, computeMatchScore, getExperienceYears } from "@/lib/profile";
import {
  CandidateCardData,
  CandidateProfile,
  SessionUser,
  ShortlistRecord,
} from "@/lib/types";

const now = new Date().toISOString();

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
    id: "user-candidate-lina",
    name: "Lina Okafor",
    email: "lina@talentflow.dev",
    password: "HireMe@2025!",
    role: "candidate",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Lina%20Okafor",
    verified: true,
  },
  {
    id: "user-candidate-diego",
    name: "Diego Alvarez",
    email: "diego@talentflow.dev",
    password: "HireMe@2025!",
    role: "candidate",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Diego%20Alvarez",
    verified: true,
  },
  {
    id: "user-candidate-maya",
    name: "Maya Chen",
    email: "maya@talentflow.dev",
    password: "HireMe@2025!",
    role: "candidate",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Maya%20Chen",
    verified: true,
  },
  {
    id: "user-recruiter-1",
    name: "Recruiter",
    email: "recruiter@talentflow.dev",
    password: "HireMe@2025!",
    role: "recruiter",
    company: "TalentFlow",
    designation: "Talent Partner",
    image: "https://api.dicebear.com/9.x/initials/svg?seed=Recruiter",
    verified: true,
  },
];

const baseProfiles: CandidateProfile[] = [
  {
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
    availability: "Open to remote roles",
    headlineSource: "ai",
    experiences: [],
    skills: [],
    projects: [],
    education: [],
    conversationLogs: [],
    updatedAt: now,
  },
  {
    id: "profile-lina",
    userId: "user-candidate-lina",
    name: "Lina Okafor",
    email: "lina@talentflow.dev",
    headline: "Product designer turned frontend engineer focused on fintech journeys",
    summary:
      "Lina Okafor blends product design instincts with frontend engineering execution. She has shipped onboarding, payments, and growth surfaces for fintech teams and translates customer pain points into clear, measurable interface improvements.",
    aiSummary:
      "Lina Okafor combines strong UI craft with frontend engineering depth, especially across acquisition and onboarding flows. She stands out for translating product ambiguity into elegant, measurable user experiences.",
    roleRecommendations: [
      "Strong match for frontend engineer, product engineer, and design systems roles.",
    ],
    completionScore: 0,
    visibility: "public",
    shareToken: "833e9daf-2680-427f-aa53-6f6cd252c4fd",
    publishedAt: now,
    pdfVersionHash: "lina-v1",
    lastEditedDeviceId: "seed-device",
    lastConflictAt: null,
    availability: "Available in 30 days",
    headlineSource: "manual",
    experiences: [
      {
        id: "exp-lina-1",
        company: "FluxPay",
        title: "Frontend Engineer",
        startDate: "2021-06-01",
        endDate: null,
        current: true,
        description:
          "Ship acquisition and onboarding flows for a high-growth fintech app across web and hybrid surfaces.",
        structuredPoints: [
          "Lifted onboarding completion by 19% after simplifying risk and KYC touchpoints.",
          "Built a component library used across design and engineering handoffs.",
        ],
      },
    ],
    skills: [
      {
        id: "skill-lina-react",
        name: "React",
        category: "Frontend",
        proficiency: "advanced",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-lina-ts",
        name: "TypeScript",
        category: "Frontend",
        proficiency: "advanced",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-lina-design",
        name: "Design Systems",
        category: "Product",
        proficiency: "advanced",
        source: "user_added",
        confirmed: true,
      },
      {
        id: "skill-lina-figma",
        name: "Figma",
        category: "Design",
        proficiency: "advanced",
        source: "user_added",
        confirmed: true,
      },
    ],
    projects: [
      {
        id: "project-lina-1",
        title: "Growth Experiment Toolkit",
        description:
          "Internal toolkit for PMs to preview landing experiments and conversion variants.",
        techStack: ["React", "TypeScript", "Storybook"],
        duration: "6 weeks",
        highlights: [
          "Enabled non-engineers to preview approved UI variants safely.",
          "Cut experiment QA time in half.",
        ],
      },
    ],
    education: [
      {
        id: "edu-lina-1",
        institution: "University of Lagos",
        degree: "B.Sc",
        field: "Computer Science",
        year: 2021,
      },
    ],
    conversationLogs: [],
    updatedAt: now,
  },
  {
    id: "profile-diego",
    userId: "user-candidate-diego",
    name: "Diego Alvarez",
    email: "diego@talentflow.dev",
    headline: "Data-minded full-stack builder with strong API and analytics experience",
    summary:
      "Diego Alvarez has built data-heavy products spanning analytics pipelines, dashboards, and internal operations tools. He is strongest when pairing backend APIs with clear frontend reporting experiences that help teams make faster decisions.",
    aiSummary:
      "Diego Alvarez is a versatile full-stack engineer with particular depth in APIs, analytics, and internal tooling. He delivers measurable wins by turning operational complexity into trustworthy product workflows.",
    roleRecommendations: [
      "Strong match for full-stack engineer and data product engineer roles.",
    ],
    completionScore: 0,
    visibility: "public",
    shareToken: "a8b61084-b6f1-4485-b800-1ddefe672c83",
    publishedAt: now,
    pdfVersionHash: "diego-v1",
    lastEditedDeviceId: "seed-device",
    lastConflictAt: null,
    availability: "Open immediately",
    headlineSource: "ai",
    experiences: [
      {
        id: "exp-diego-1",
        company: "SignalOps",
        title: "Software Engineer",
        startDate: "2020-01-01",
        endDate: null,
        current: true,
        description:
          "Build internal tools and customer-facing analytics features for operations teams.",
        structuredPoints: [
          "Cut manual reporting effort by 12 hours per week through workflow automation.",
          "Built a unified API layer adopted by internal dashboards and partner exports.",
        ],
      },
    ],
    skills: [
      {
        id: "skill-diego-node",
        name: "Node.js",
        category: "Backend",
        proficiency: "advanced",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-diego-sql",
        name: "SQL",
        category: "Data",
        proficiency: "advanced",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-diego-react",
        name: "React",
        category: "Frontend",
        proficiency: "intermediate",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-diego-analytics",
        name: "Analytics",
        category: "Data",
        proficiency: "advanced",
        source: "user_added",
        confirmed: true,
      },
    ],
    projects: [],
    education: [
      {
        id: "edu-diego-1",
        institution: "Tecnológico de Monterrey",
        degree: "B.Eng",
        field: "Software Engineering",
        year: 2019,
      },
    ],
    conversationLogs: [],
    updatedAt: now,
  },
  {
    id: "profile-maya",
    userId: "user-candidate-maya",
    name: "Maya Chen",
    email: "maya@talentflow.dev",
    headline: "Early-career engineer with strong project depth and AI-assisted product work",
    summary:
      "Maya Chen is an early-career engineer who stands out through strong project execution and fast iteration. Her profile shows initiative across AI tooling, collaboration, and end-to-end shipping even without a long formal work history.",
    aiSummary:
      "Maya Chen is an early-career builder with strong project-based evidence of execution, curiosity, and learning velocity. She is especially well suited to junior frontend and product engineering roles.",
    roleRecommendations: [
      "Strong match for junior frontend and associate product engineering roles.",
      "Adding one internship or volunteer experience would raise recruiter confidence further.",
    ],
    completionScore: 0,
    visibility: "public",
    shareToken: "f54719d9-35bb-41d1-84c8-29f3f6ca80fd",
    publishedAt: now,
    pdfVersionHash: "maya-v1",
    lastEditedDeviceId: "seed-device",
    lastConflictAt: null,
    availability: "Open to internships and graduate roles",
    headlineSource: "ai",
    experiences: [],
    skills: [
      {
        id: "skill-maya-react",
        name: "React",
        category: "Frontend",
        proficiency: "intermediate",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-maya-next",
        name: "Next.js",
        category: "Frontend",
        proficiency: "intermediate",
        source: "ai_suggested",
        confirmed: true,
      },
      {
        id: "skill-maya-python",
        name: "Python",
        category: "Backend",
        proficiency: "intermediate",
        source: "user_added",
        confirmed: true,
      },
    ],
    projects: [
      {
        id: "project-maya-1",
        title: "Campus Mentor Finder",
        description:
          "Built a mentor matching app for students looking for peer support and project guidance.",
        techStack: ["Next.js", "Supabase", "Tailwind CSS"],
        duration: "8 weeks",
        highlights: [
          "Ran 12 discovery interviews before building the first version.",
          "Reached 250+ student signups in the first semester.",
        ],
      },
      {
        id: "project-maya-2",
        title: "Study Notes Summariser",
        description:
          "Created an AI-assisted note summarisation workflow for class material.",
        techStack: ["Python", "LangChain", "Streamlit"],
        duration: "3 weeks",
        highlights: [
          "Reduced revision preparation time for classmates.",
        ],
      },
    ],
    education: [
      {
        id: "edu-maya-1",
        institution: "National University of Singapore",
        degree: "B.Comp",
        field: "Computer Science",
        year: 2026,
      },
    ],
    conversationLogs: [],
    updatedAt: now,
  },
];

export const demoProfiles: CandidateProfile[] = baseProfiles.map((profile) => ({
  ...profile,
  completionScore: calculateCompletionScore(profile),
}));

export const demoShortlists: ShortlistRecord[] = [
  {
    id: "shortlist-1",
    recruiterId: "user-recruiter-1",
    candidateId: "user-demo-candidate",
    stage: "shortlisted",
    notes: "Strong frontend ownership and polished communication.",
    addedAt: now,
  },
  {
    id: "shortlist-2",
    recruiterId: "user-recruiter-1",
    candidateId: "user-candidate-lina",
    stage: "under_review",
    notes: "Great product sensibility.",
    addedAt: now,
  },
  {
    id: "shortlist-3",
    recruiterId: "user-recruiter-1",
    candidateId: "user-candidate-diego",
    stage: "viewed",
    addedAt: now,
  },
];

export function buildCandidateCards(): CandidateCardData[] {
  return demoProfiles.map((profile) => {
    const shortlist = demoShortlists.find(
      (item) => item.candidateId === profile.userId,
    );

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
