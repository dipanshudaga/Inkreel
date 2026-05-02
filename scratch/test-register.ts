import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function testRegister() {
  const username = "testuser_" + Date.now();
  const password = "password123";
  const name = "Test User";

  console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
  console.log(`Attempting to register ${username}...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name,
      username,
      passwordHash,
    });
    console.log("Registration successful!");
    
    // Clean up
    await db.delete(users).where(eq(users.username, username));
    console.log("Cleanup successful!");
    process.exit(0);
  } catch (err) {
    console.error("Registration failed:", err);
    process.exit(1);
  }
}

testRegister();
