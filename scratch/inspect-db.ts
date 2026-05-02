import { db } from "../src/lib/db";
import { media } from "../src/lib/db/schema";
import { eq, or } from "drizzle-orm";

async function inspectGenres() {
  console.log("--- DATABASE GENRE INSPECTION ---");
  
  // Find a user (assuming the first one for this test)
  const allMedia = await db.select({ 
    id: media.id, 
    title: media.title, 
    genres: media.genres,
    type: media.type 
  }).from(media).limit(100);

  console.log(`Inspecting ${allMedia.length} items...`);
  
  const genreCounts: Record<string, number> = {};
  const sampleValues: Set<string> = new Set();

  allMedia.forEach(m => {
    if (m.genres) sampleValues.add(m.genres);
    const raw = m.genres || "";
    const split = raw.split(',').map(g => g.trim()).filter(Boolean);
    split.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  console.log("Sample Raw Values in DB:");
  Array.from(sampleValues).slice(0, 10).forEach(v => console.log(` - "${v}"`));

  console.log("\nDetected Genres (using current split logic):");
  console.log(JSON.stringify(genreCounts, null, 2));
  
  console.log("--- INSPECTION END ---");
}

inspectGenres().catch(console.error);
