import PocketBase from "pocketbase";

function getPocketBaseUrl() {
  return process.env.NEXT_PUBLIC_POCKETBASE_URL;
}

export function hasPocketBaseConfig() {
  return Boolean(getPocketBaseUrl());
}

export function createPocketBaseClient() {
  const pocketbaseUrl = getPocketBaseUrl();

  if (!pocketbaseUrl) {
    throw new Error("PocketBase URL is not configured.");
  }

  return new PocketBase(pocketbaseUrl);
}

export async function createPocketBaseAdminClient() {
  const pocketbaseUrl = getPocketBaseUrl();
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!pocketbaseUrl || !email || !password) {
    return null;
  }

  const client = new PocketBase(pocketbaseUrl);
  try {
    await client.collection("_superusers").authWithPassword(email, password);
  } catch {
    return null;
  }

  return client;
}

export const PB_COLLECTIONS = {
  users: "users",
  profiles: "profiles",
  shortlists: "shortlists",
} as const;
