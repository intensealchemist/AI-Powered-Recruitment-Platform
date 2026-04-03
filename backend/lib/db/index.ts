import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export function hasTursoConfig() {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) return null;

  const client = createClient({ url, authToken });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
