import { db } from "../index";
import { media } from "../schema";
import { eq } from "drizzle-orm";

async function migrateSlugs() {
  console.log("Starting slug migration...");
  const allMedia = await db.select().from(media);
  
  for (const item of allMedia) {
    const cleanSlug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (item.slug !== cleanSlug) {
      console.log(`Updating slug: ${item.slug} -> ${cleanSlug}`);
      await db.update(media)
        .set({ slug: cleanSlug })
        .where(eq(media.id, item.id));
    }
  }
  
  console.log("Migration complete.");
}

migrateSlugs().catch(console.error);
