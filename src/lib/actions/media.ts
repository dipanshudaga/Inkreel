"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { searchMovies } from "@/lib/api/tmdb";
import { searchBooks } from "@/lib/api/google-books";

export async function saveMediaAction(item: any) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    const [inserted] = await db.insert(media).values({
      userId: session.user.id,
      title: item.title,
      category: item.category || (item.type === 'book' || item.type === 'manga' ? 'read' : 'watch'),
      status: item.status || "watchlist",
      type: item.type || (item.category === 'read' ? 'book' : 'movie'),
      externalId: item.externalId || item.id,
      posterUrl: item.posterUrl,
      releaseYear: typeof item.year === 'string' ? parseInt(item.year) : (item.year || item.releaseYear),
    }).returning({ id: media.id });
    
    revalidatePath("/watch");
    revalidatePath("/read");
    return { success: true, id: inserted.id };
  } catch (error) {
    console.error("Failed to save media:", error);
    return { success: false };
  }
}

export async function updateMediaAction(externalId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    if (status === "none") {
      await db.delete(media).where(
        and(
          eq(media.userId, session.user.id),
          eq(media.externalId, externalId)
        )
      );
    } else {
      await db.update(media)
        .set({ status })
        .where(
          and(
            eq(media.userId, session.user.id),
            eq(media.externalId, externalId)
          )
        );
    }
    
    revalidatePath("/watch");
    revalidatePath("/read");
    return { success: true };
  } catch (error) {
    console.error("Failed to update media:", error);
    return { success: false };
  }
}

export async function saveImportedMediaAction(items: any[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    const values = items.map(item => ({
      userId: session.user.id,
      title: item.title,
      category: item.category,
      status: item.status,
      externalId: item.externalId,
      posterUrl: item.posterUrl,
      releaseYear: item.year,
    }));

    await db.insert(media).values(values).onConflictDoNothing();
    
    revalidatePath("/watch");
    revalidatePath("/read");
    revalidatePath("/import");
    return { success: true };
  } catch (error) {
    console.error("Failed to save imported media:", error);
    return { success: false };
  }
}

export async function getUserMediaAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, items: {} };

  try {
    const userMedia = await db
      .select()
      .from(media)
      .where(eq(media.userId, session.user.id));
    const items = userMedia.map(m => ({
      id: m.id,
      externalId: m.externalId,
      title: m.title,
      category: m.category,
      status: m.status,
      posterUrl: m.posterUrl,
      year: m.releaseYear
    }));
    
    return { success: true, items };
  } catch (error) {
    console.error("Failed to get user media:", error);
    return { success: false, items: {} };
  }
}

export async function searchMediaAction(query: string, category: "watch" | "read") {
  try {
    if (category === "watch") {
      const results = await searchMovies(query);
      return { success: true, results };
    } else if (category === "read") {
      const results = await searchBooks(query);
      return { success: true, results };
    }
    return { success: true, results: [] };
  } catch (error) {
    console.error("Search media action failed:", error);
    return { success: false, results: [] };
  }
}

export async function batchSearchMediaAction(queries: { query: string; category: "watch" | "read" }[]) {
  try {
    const resultsSettled = await Promise.allSettled(
      queries.map(async (q) => {
        if (q.category === "watch") {
          // Pass 1: Primary search (usually Title + Year)
          let movies = await searchMovies(q.query);
          
          // Pass 2: Fallback to Title only if Pass 1 failed
          if (movies.length === 0 && q.query.match(/\d{4}$/)) {
            const titleOnly = q.query.replace(/\s\d{4}$/, "");
            movies = await searchMovies(titleOnly);
          }
          
          return movies[0] || null;
        } else if (q.category === "read") {
          const books = await searchBooks(q.query);
          return books[0] || null;
        }
        return null;
      })
    );

    const results = resultsSettled.map((res) => (res.status === "fulfilled" ? res.value : null));
    return { success: true, results };
  } catch (error) {
    console.error("Batch search failed:", error);
    return { success: false, results: [] };
  }
}
