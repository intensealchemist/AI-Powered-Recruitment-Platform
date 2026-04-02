# Backend — AI-Powered Recruitment Platform

This directory contains the standalone backend logic: AI integration, data access layer, database scripts, and schema migrations.

The Next.js frontend (`../frontend`) imports from this same logic at runtime via the `@/lib/...` path alias. This directory additionally serves as the authoritative reference for the backend data and AI layer, and contains scripts that can be run independently of the Next.js process.

## Structure

```
backend/
├── lib/
│   ├── groq.ts          # Groq LLM client — conversational extraction, JSON mode, fallback
│   ├── data.ts          # Data access layer — PocketBase + in-memory demo fallback
│   ├── demo-data.ts     # Seeded demo profiles for offline/demo mode
│   ├── pocketbase.ts    # PocketBase client singleton
│   ├── auth.ts          # Auth helpers — session management, OAuth token exchange
│   ├── profile.ts       # Profile normalisation and transformation
│   ├── types.ts         # Canonical type definitions
│   └── utils.ts         # Shared utilities
├── scripts/
│   └── seed-pocketbase.ts   # Seeds demo users, profiles, shortlists into PocketBase
├── prisma/
│   └── migration.sql    # Reference SQL migration
├── package.json
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env
# Fill in GROQ_API_KEY, NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD
```

## Scripts

```bash
# Seed demo data into PocketBase (PocketBase must be running first)
npm run db:seed
```
