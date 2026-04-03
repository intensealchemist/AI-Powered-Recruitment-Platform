import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const getDbUrl = () => {
    return process.env.TURSO_DATABASE_URL;
};

const getAuthToken = () => {
    return process.env.TURSO_AUTH_TOKEN;
};

export function hasTursoConfig() {
    return Boolean(getDbUrl());
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = getDbUrl();
  const authToken = getAuthToken();

  if (!url) {
    return null;
  }

  const client = createClient({
    url,
    authToken,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
