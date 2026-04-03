import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env.local (Next.js convention) so drizzle-kit can read TURSO_* vars
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") }); // fallback

import type { Config } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL is not set.\n" +
    "Add it to frontend/.env.local:\n" +
    "  TURSO_DATABASE_URL=libsql://your-db.turso.io\n" +
    "  TURSO_AUTH_TOKEN=your_token\n" +
    "Get your credentials at https://app.turso.tech"
  );
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
