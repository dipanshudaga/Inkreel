import { db } from "./src/lib/db";
import { media, logs } from "./src/lib/db/schema";

async function clearDb() {
  console.log("Clearing database...");
  await db.delete(logs);
  await db.delete(media);
  console.log("Database cleared successfully.");
  process.exit(0);
}

clearDb().catch(err => {
  console.error("Failed to clear database:", err);
  process.exit(1);
});
