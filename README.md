# AI-Powered Recruitment Platform

A **conversation-first hiring experience** that replaces resume uploads with a structured, AI-driven interview. Candidates answer natural-language questions; the platform extracts structured profile data in real time. Recruiters see normalized, comparable profiles — no PDF bias, no formatting lottery.

---

## Repository Structure

```
/
├── frontend/          # Next.js 15 App Router — UI, pages, API routes, server actions
├── backend/           # Backend logic — AI layer, data access, scripts, DB schema
└── README.md          # This file
```

### `/frontend`

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router pages, route handlers (`app/api/`), and server actions (`app/actions/`) |
| `components/` | React UI components organised by feature (candidate, recruiter, ui, layout, pdf, providers) |
| `lib/types.ts` | Shared TypeScript types |
| `lib/utils.ts` | Utility helpers (`cn()`) |
| `public/` | Static assets |
| `next.config.ts` | Next.js configuration |
| `package.json` | Frontend dependencies |

### `/backend`

| Path | Purpose |
|---|---|
| `lib/groq.ts` | Groq API client — conversational extraction, JSON parsing, model fallback |
| `lib/data.ts` | Data access layer — PocketBase reads/writes with in-memory demo fallback |
| `lib/demo-data.ts` | Seeded demo profiles for offline/demo mode |
| `lib/pocketbase.ts` | PocketBase client singleton |
| `lib/auth.ts` | Auth helpers — session management, OAuth token exchange |
| `lib/profile.ts` | Profile transformation and normalisation utilities |
| `lib/types.ts` | Canonical type definitions (mirrored to frontend) |
| `scripts/seed-pocketbase.ts` | Seeds demo users, candidate profiles, and shortlist records |
| `prisma/migration.sql` | Raw SQL migration for reference |
| `package.json` | Backend-only dependencies |

---

## Tech Stack & Justification

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components + server actions collapse the network boundary — AI extraction runs server-side with zero client exposure of API keys. Route handlers double as lightweight backend endpoints without a separate server process. |
| **Language** | TypeScript (strict) | End-to-end type safety across the frontend/backend boundary. Shared `types.ts` ensures candidate profile shapes never drift between the UI and the data layer. |
| **Styling** | Tailwind CSS 4 | Utility-first styling keeps component markup self-documenting. v4's new engine removes the purge step and compiles 40 % faster than v3. |
| **AI / LLM** | Groq API (Llama 3) | Sub-second inference latency makes real-time conversational extraction feel responsive. JSON-mode output eliminates fragile regex parsing. Automatic fallback to a secondary model handles rate limits gracefully. |
| **Database** | PocketBase | Single-binary BaaS with built-in auth, real-time subscriptions, and a REST + typed SDK. Eliminates standing up a separate auth service. Swappable with Postgres via the in-memory fallback interface in `lib/data.ts`. |
| **Client data** | TanStack Query v5 | Declarative server-state fetching for the recruiter dashboard. Stale-while-revalidate keeps the shortlist board live without polling noise. |
| **PDF export** | `@react-pdf/renderer` | Renders ATS-friendly structured resumes from in-memory profile data — no HTML-to-PDF conversion heuristics, no layout surprises. |
| **Forms** | React Hook Form + Zod | Uncontrolled form performance with schema-validated, type-safe field resolution. Zod schemas are shared between the server action validation layer and client-side error messages. |
| **Notifications** | Sonner | Lightweight toast library with compound variants; integrates with server action response patterns cleanly. |
| **Fonts** | Inter + IBM Plex Mono | Inter for clean UI legibility; Plex Mono gives the AI voice a distinct, warmer mono aesthetic without feeling technical. |

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 20
- [PocketBase](https://pocketbase.io/docs/) binary running locally (or use demo/in-memory mode)
- A [Groq API key](https://console.groq.com/)

---

### 1. Clone

```bash
git clone <your-repo-url>
cd AI-Powered-Recruitment-Platform
```

---

### 2. Frontend setup

```bash
cd frontend
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_admin_password
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No PocketBase?** The app automatically falls back to in-memory demo data. Leave `NEXT_PUBLIC_POCKETBASE_URL` blank and skip the seeding step.

---

### 3. Backend setup (optional — for seeding and standalone scripts)

```bash
cd backend
npm install
```

Copy the environment template:

```bash
cp .env.example .env
```

Fill in `.env` with the same Groq and PocketBase values.

---

### 4. Seed demo data (optional)

Start PocketBase first, then from the `backend/` directory:

```bash
npm run db:seed
```

This creates demo users, candidate profiles, and shortlist records.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Candidate | `hire-me@anshumat.org` | `HireMe@2025!` |

---

## AI Design Philosophy

The platform treats the AI as a **structured interview layer**, not a document parser.

- **Conversational extraction** — Natural-language answers are converted server-side into `experience`, `skills`, `headline`, and `summary` fields via Groq's JSON mode. No resume upload, no OCR, no field-mapping heuristics.
- **Follow-up probing** — The model asks for measurable outcomes when answers are vague (e.g., "grew the team" → "from how many to how many?").
- **Skill suggestion** — Inferred competencies are surfaced as confirmable chips so candidates stay in control of their own profile.
- **Auto-summary generation** — A recruiter-ready third-person paragraph is generated once enough structured signal appears, saving candidates from writing about themselves in third person.
- **Role recommendations** — Strengths and gaps are surfaced without penalising non-linear careers.
- **Graceful degradation** — Falls back to manual editing when Groq is unavailable or rate-limited.
- **Offline queueing** — Unsent messages are stored in `localStorage` and replayed on reconnect.

---

## Deliberate Omissions

| Feature | Reason omitted |
|---|---|
| Resume upload | Reintroduces the formatting bias the product is designed to remove |
| Traditional document parsing | Would re-anchor evaluation on PDF structure rather than candidate signal |
| Separate job-posting workflow | Out of scope for v1; recruiter matching currently uses profile strength and seeded shortlist flows |
| Dedicated auth server | PocketBase's built-in auth covers OAuth + email/password without a separate service |
