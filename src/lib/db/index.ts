import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dns from "dns";

// 1. Force IPv4 priority immediately
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const connectionString = process.env.DATABASE_URL!;

// Prevent multiple connections in development
declare global {
  var postgres: ReturnType<typeof postgres> | undefined;
}

const client = global.postgres || postgres(connectionString, { 
  prepare: false,
  connect_timeout: 15,
  max_lifetime: 60 * 30, // 30 minutes
});

if (process.env.NODE_ENV !== "production") {
  global.postgres = client;
}

export const db = drizzle(client, { schema });
