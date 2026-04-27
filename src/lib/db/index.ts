import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dns from "dns";

// 1. Force IPv4 priority immediately
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const connectionString = process.env.DATABASE_URL;

// 2. Priming the DNS cache (helps ENOTFOUND on some serverless nodes)
if (connectionString) {
  try {
    const url = new URL(connectionString);
    dns.lookup(url.hostname, (err, address) => {
      if (err) console.error("🔍 DNS Lookup failed for:", url.hostname, err);
      else console.log("🔍 DNS resolved:", url.hostname, "->", address);
    });
  } catch (e) {
    // Ignore invalid URLs here, will be caught later
  }
}

const client = postgres(connectionString || "", { 
  prepare: false,
  connect_timeout: 10,
  max_lifetime: 60 * 30, // 30 minutes
});

export const db = drizzle(client, { schema });
