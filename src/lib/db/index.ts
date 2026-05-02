import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dns from "dns";

// DNS result order fix removed as DB is IPv6 only

const connectionString = process.env.DATABASE_URL!;

// Prevent multiple connections in development
declare global {
  var _postgres: ReturnType<typeof postgres> | undefined;
}

const client = global._postgres || postgres(connectionString, { 
  prepare: false,
  connect_timeout: 15,
  max_lifetime: 60 * 30, // 30 minutes
});

if (process.env.NODE_ENV !== "production") {
  global._postgres = client;
}

export const db = drizzle(client, { schema });
