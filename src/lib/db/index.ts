import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: ".env.local" });

import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing! Ensure it is set in Vercel Environment Variables.");
}

// Disable prefetch as it is not supported for "Transaction" mode in Supabase
const client = postgres(connectionString || "", { 
  prepare: false,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
