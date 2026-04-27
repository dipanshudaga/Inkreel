"use server";

import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { searchTMDB } from "@/lib/api/tmdb";
import { searchGoogleBooks } from "@/lib/api/google-books";
import { revalidatePath } from "next/cache";

export async function importLetterboxdAction(data: any[]) {
  let importedCount = 0;
  let skippedCount = 0;

  // Process in small chunks to avoid timeouts and rate limits
  const chunkSize = 5;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (row) => {
      const title = row.Name;
      const year = parseInt(row.Year);
      const rating = parseFloat(row.Rating) || null;
      const watchedDateStr = row["Watched Date"] || row.Date;
      const watchedDate = watchedDateStr ? new Date(watchedDateStr) : new Date();

      if (!title) return;

      try {
        const existing = await db.query.media.findFirst({
          where: and(eq(media.title, title), eq(media.category, "watch")),
        });

        if (existing) {
          skippedCount++;
          return;
        }

        const searchResults = await searchTMDB(title);
        const match = searchResults.find((r: any) => 
          r.title.toLowerCase() === title.toLowerCase() && 
          (!year || r.year === year)
        ) || searchResults[0];

        const [newMedia] = await db.insert(media).values({
          externalId: match?.id || `lb-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: title,
          category: "watch",
          type: match?.type || "movie",
          posterUrl: match?.posterUrl || null,
          releaseYear: year || match?.year || null,
          description: match?.description || "",
          status: "completed",
          rating: rating,
          completedAt: watchedDate.toISOString(),
        }).returning();

        await db.insert(logs).values({
          mediaId: newMedia.id,
          date: watchedDate.toISOString(),
          action: "finished",
          notes: row.Tags || "",
        });

        importedCount++;
      } catch (error) {
        console.error(`Failed to import Letterboxd item: ${title}`, error);
        skippedCount++;
      }
    }));
  }

  revalidatePath("/watch");
  return { success: true, importedCount, skippedCount };
}

export async function importGoodreadsAction(data: any[]) {
  let importedCount = 0;
  let skippedCount = 0;

  const chunkSize = 5;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    await Promise.all(chunk.map(async (row) => {
      const title = row.Title;
      const author = row.Author;
      const rating = parseFloat(row["My Rating"]) || null;
      const dateReadStr = row["Date Read"];
      const dateRead = dateReadStr ? new Date(dateReadStr) : null;

      if (!title) return;

      try {
        const existing = await db.query.media.findFirst({
          where: and(eq(media.title, title), eq(media.category, "read")),
        });

        if (existing) {
          skippedCount++;
          return;
        }

        const searchResults = await searchGoogleBooks(title);
        const match = searchResults.find((r: any) => 
          r.title.toLowerCase() === title.toLowerCase() && 
          (!author || r.creator.toLowerCase().includes(author.toLowerCase()))
        ) || searchResults[0];

        const [newMedia] = await db.insert(media).values({
          externalId: match?.id || `gr-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: title,
          category: "read",
          type: match?.type || "book",
          posterUrl: match?.posterUrl || null,
          releaseYear: match?.year || null,
          description: match?.description || "",
          status: dateRead ? "completed" : "plan_to_read",
          rating: rating,
          completedAt: dateRead?.toISOString() || null,
        }).returning();

        if (dateRead) {
          await db.insert(logs).values({
            mediaId: newMedia.id,
            date: dateRead.toISOString(),
            action: "finished",
            notes: row["My Review"] || "",
          });
        }

        importedCount++;
      } catch (error) {
        console.error(`Failed to import Goodreads item: ${title}`, error);
        skippedCount++;
      }
    }));
  }

  revalidatePath("/read");
  return { success: true, importedCount, skippedCount };
}
