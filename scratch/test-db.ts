import { db } from "./src/lib/db";
import { users } from "./src/lib/db/schema";

async function test() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users count:", allUsers.length);
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

test();
