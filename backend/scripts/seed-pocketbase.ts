import { demoProfiles, demoShortlists, demoUsers } from "../lib/demo-data";
import { PB_COLLECTIONS, createPocketBaseAdminClient } from "../lib/pocketbase";

async function ensureEnvLoaded() {
  const required = [
    "NEXT_PUBLIC_POCKETBASE_URL",
    "POCKETBASE_ADMIN_EMAIL",
    "POCKETBASE_ADMIN_PASSWORD",
  ] as const;

  const missingBefore = required.filter((key) => !process.env[key]);
  if (missingBefore.length === 0) {
    return;
  }

  const { loadEnvConfig } = await import("@next/env");
  const path = await import("node:path");
  
  loadEnvConfig(process.cwd());
  
  // If still missing, check the frontend directory manually
  if (!process.env.POCKETBASE_ADMIN_EMAIL) {
    const fs = await import("node:fs");
    const envPath = path.resolve(process.cwd(), "../frontend/.env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value;
        }
      });
    }
  }
}

function hasPocketBaseSeedConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_POCKETBASE_URL &&
      process.env.POCKETBASE_ADMIN_EMAIL &&
      process.env.POCKETBASE_ADMIN_PASSWORD,
  );
}

async function getSeedClient() {
  await ensureEnvLoaded();

  if (!hasPocketBaseSeedConfig()) {
    throw new Error("PocketBase admin credentials are not configured.");
  }

  return createPocketBaseAdminClient();
}

async function upsertUsers() {
  const client = await getSeedClient();

  if (!client) {
    console.log("PocketBase is unavailable. Skipping seed and keeping demo data.");
    return false;
  }

  const existingUsers = await client.collection(PB_COLLECTIONS.users).getFullList<{ id: string; email: string }>({
    fields: "id,email",
  });

  for (const user of demoUsers) {
    const existing = existingUsers.find((item) => item.email.toLowerCase() === user.email.toLowerCase());
    const resolvedPassword = user.password?.trim() || "HireMe@2025!";
    const payload = {
      ...user,
      password: resolvedPassword,
      passwordConfirm: resolvedPassword,
    };

    if (existing) {
      await client.collection(PB_COLLECTIONS.users).update(existing.id, payload);
      continue;
    }

    await client.collection(PB_COLLECTIONS.users).create(payload);
  }

  return true;
}

async function upsertRecords<T extends { id: string }>(collection: string, records: T[]) {
  const client = await getSeedClient();

  if (!client) {
    return;
  }

  const existingRecords = await client.collection(collection).getFullList<{ id: string }>({
    fields: "id",
  });
  const existingIds = new Set(existingRecords.map((item) => item.id));

  for (const record of records) {
    if (existingIds.has(record.id)) {
      await client.collection(collection).update(record.id, record);
      continue;
    }

    await client.collection(collection).create(record);
  }
}

async function main() {
  const didSeed = await upsertUsers();

  if (!didSeed) {
    return;
  }

  await upsertRecords(PB_COLLECTIONS.profiles, demoProfiles);
  await upsertRecords(PB_COLLECTIONS.shortlists, demoShortlists);
  console.log("PocketBase seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
