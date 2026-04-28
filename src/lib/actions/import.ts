"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getMovieById, getTVById, searchMovies } from "@/lib/api/tmdb";
import { getBookById, searchBooks } from "@/lib/api/google-books";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

export async function importLetterboxdAction(data: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let importedCount = 0;
  let skippedCount = 0;

  const chunkSize = 5;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (row) => {
      const title = row.Name;
      const year = parseInt(row.Year);
      const rating = parseFloat(row.Rating) || null;

      if (!title) return;

      try {
        const existing = await db.query.media.findFirst({
          where: and(
            eq(media.title, title), 
            eq(media.userId, session.user.id),
            eq(media.category, "watch")
          ),
        });

        if (existing) {
          skippedCount++;
          return;
        }

        const searchResults = await searchMovies(title);
        const searchMatch = searchResults.find((r: any) => 
          r.title.toLowerCase() === title.toLowerCase() && 
          (!year || r.year === year)
        ) || searchResults[0];

        if (!searchMatch) {
          skippedCount++;
          return;
        }

        let match: any = searchMatch;
        try {
          const rawId = searchMatch.id.replace("tmdb-movie-", "").replace("tmdb-tv-", "");
          const fullDetail = searchMatch.type === "tv" || searchMatch.type === "anime" 
            ? await getTVById(rawId) 
            : await getMovieById(rawId);
          if (fullDetail) match = fullDetail;
        } catch (e) {}

        let languageName = "Unknown";
        try {
          if (match.languageCode) {
            languageName = languageNames.of(match.languageCode) || "Unknown";
          }
        } catch (e) {}

        const status = (rating && rating >= 4.5) ? "loved" : "completed";

        await db.insert(media).values({
          userId: session.user.id,
          externalId: match?.id || `lb-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: title,
          category: "watch",
          type: match?.type || "movie",
          format: match?.format || "Feature Film",
          tagline: match?.tagline,
          posterUrl: match?.posterUrl || null,
          backdropUrl: match?.backdropUrl || null,
          releaseYear: year || match?.releaseYear || null,
          creator: match?.creator || "Director",
          genres: Array.isArray(match?.genres) ? match.genres.join(", ") : (match?.genres || ""),
          runtime: match?.runtime || null,
          description: match?.description || "",
          language: languageName,
          status: status,
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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

      if (!title) return;

      try {
        const existing = await db.query.media.findFirst({
          where: and(
            eq(media.title, title), 
            eq(media.userId, session.user.id),
            eq(media.category, "read")
          ),
        });

        if (existing) {
          skippedCount++;
          return;
        }

        const searchResults = await searchBooks(title);
        const searchMatch = searchResults.find((r: any) => 
          r.title.toLowerCase() === title.toLowerCase()
        ) || searchResults[0];

        if (!searchMatch) {
          skippedCount++;
          return;
        }

        let match: any = searchMatch;
        try {
          const rawId = searchMatch.id.replace("gb-", "");
          const fullDetail = await getBookById(rawId);
          if (fullDetail) match = fullDetail;
        } catch (e) {}

        let languageName = "Unknown";
        try {
          if (match.languageCode) {
            languageName = languageNames.of(match.languageCode) || "Unknown";
          }
        } catch (e) {}

        let status = dateReadStr ? "completed" : "shelf";
        if (rating && rating >= 4.5) status = "loved";

        await db.insert(media).values({
          userId: session.user.id,
          externalId: match?.id || `gr-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: title,
          category: "read",
          type: match?.type || "book",
          format: match?.format || "Book",
          subtitle: match?.subtitle,
          posterUrl: match?.posterUrl || null,
          backdropUrl: match?.backdropUrl || null,
          releaseYear: match?.releaseYear || null,
          creator: match?.creator || author || "Author",
          genres: Array.isArray(match?.genres) ? match.genres.join(", ") : (match?.genres || ""),
          pageCount: match?.pageCount || null,
          description: match?.description || "",
          language: languageName,
          status: status,
        });

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
