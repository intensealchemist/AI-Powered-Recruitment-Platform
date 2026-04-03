import { config } from "dotenv";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

// Load env from frontend/.env.local if not already set
function loadEnv() {
  const paths = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "../frontend/.env.local"),
    resolve(process.cwd(), ".env"),
  ];

  for (const envPath of paths) {
    if (existsSync(envPath)) {
      config({ path: envPath });
    }
  }
}

loadEnv();

import { getDb, hasTursoConfig } from "../lib/db";
import { users, profiles, shortlists } from "../lib/db/schema";
import { demoProfiles, demoShortlists, demoUsers } from "../lib/demo-data";

async function main() {
  if (!hasTursoConfig()) {
    console.error(
      "❌  TURSO_DATABASE_URL is not set. Please add it to your .env.local file.\n" +
      "    Get your URL from https://app.turso.tech",
    );
    process.exit(1);
  }

  const db = getDb();
  if (!db) {
    console.error("❌  Could not connect to Turso database. Check your credentials.");
    process.exit(1);
  }

  console.log("🌱  Seeding Turso database with demo data…");

  // Upsert users
  for (const user of demoUsers) {
    const resolvedPassword = user.password?.trim() || "HireMe@2025!";
    await db
      .insert(users)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
        password: resolvedPassword,
        role: user.role,
        verified: user.verified ?? false,
        demo: user.demo ?? false,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          role: user.role,
          verified: user.verified ?? false,
          demo: user.demo ?? false,
        },
      });
  }
  console.log(`  ✔  Upserted ${demoUsers.length} users`);

  // Upsert profiles
  for (const profile of demoProfiles) {
    await db
      .insert(profiles)
      .values({
        id: profile.id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        headline: profile.headline ?? "",
        summary: profile.summary ?? "",
        aiSummary: profile.aiSummary ?? "",
        roleRecommendations: profile.roleRecommendations ?? [],
        completionScore: profile.completionScore ?? 0,
        visibility: profile.visibility ?? "private",
        shareToken: profile.shareToken,
        publishedAt: profile.publishedAt ?? undefined,
        pdfVersionHash: profile.pdfVersionHash ?? "draft",
        lastEditedDeviceId: profile.lastEditedDeviceId ?? undefined,
        lastConflictAt: profile.lastConflictAt ?? undefined,
        availability: profile.availability ?? "Open to opportunities",
        headlineSource: profile.headlineSource ?? "ai",
        experiences: profile.experiences ?? [],
        skills: profile.skills ?? [],
        projects: profile.projects ?? [],
        education: profile.education ?? [],
        conversationLogs: profile.conversationLogs ?? [],
        updatedAt: profile.updatedAt ?? new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name: profile.name,
          headline: profile.headline ?? "",
          updatedAt: profile.updatedAt ?? new Date().toISOString(),
        },
      });
  }
  console.log(`  ✔  Upserted ${demoProfiles.length} profiles`);

  // Upsert shortlists
  for (const shortlist of demoShortlists) {
    await db
      .insert(shortlists)
      .values({
        id: shortlist.id,
        recruiterId: shortlist.recruiterId,
        candidateId: shortlist.candidateId,
        stage: shortlist.stage,
        notes: shortlist.notes,
        addedAt: shortlist.addedAt,
      })
      .onConflictDoUpdate({
        target: shortlists.id,
        set: {
          stage: shortlist.stage,
          notes: shortlist.notes,
        },
      });
  }
  console.log(`  ✔  Upserted ${demoShortlists.length} shortlist entries`);

  console.log("\n✅  Turso seed completed successfully!");
}

main().catch((error) => {
  console.error("❌  Seed failed:", error);
  process.exit(1);
});
