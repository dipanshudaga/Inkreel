"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { matchWatchItem } from "@/lib/algorithms/movie-matcher";
import { matchReadItem } from "@/lib/algorithms/book-matcher";
import { searchMoviesForRematch } from "@/lib/algorithms/movie-searcher";
import { searchBooksForRematch } from "@/lib/algorithms/book-searcher";

export async function saveMediaAction(item: any) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    const now = new Date();
    const status = item.status || "watchlist";
    
    const [inserted] = await db.insert(media).values({
      userId: session.user.id,
      title: item.title,
      category: item.category || (item.type === 'book' || item.type === 'manga' ? 'read' : 'watch'),
      status: status,
      type: item.type || (item.category === 'read' ? 'book' : 'movie'),
      externalId: item.externalId || item.id,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      tagline: item.tagline,
      subtitle: item.subtitle,
      description: item.description,
      creator: item.creator,
      genres: Array.isArray(item.genres) ? item.genres.join(', ') : item.genres,
      format: item.format,
      language: item.language,
      runtime: item.runtime,
      pageCount: item.pageCount,
      releaseYear: typeof item.year === 'string' ? parseInt(item.year) : (item.year || item.releaseYear),
      watchlistedAt: (status === "watchlist" || status === "shelf") ? now : null,
      completedAt: (status === "completed" || status === "loved") ? now : null,
      favoritedAt: status === "loved" ? now : null,
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalId);
    const identifier = isUuid ? media.id : media.externalId;

    if (status === "none") {
      // Soft-delete: update status to "none" instead of deleting record
      // This keeps the metadata in DB so the detail page still works 
      // even after unselecting from collection.
      await db.update(media)
        .set({ status: "none" })
        .where(
          and(
            eq(media.userId, session.user.id),
            eq(identifier, externalId)
          )
        );
    } else {
      const now = new Date();
      const updateData: any = { status };
      
      if (status === "watchlist" || status === "shelf") {
        updateData.watchlistedAt = now;
      } else if (status === "completed" || status === "loved") {
        updateData.completedAt = now;
      }
      
      if (status === "loved") {
        updateData.favoritedAt = now;
      }

      await db.update(media)
        .set(updateData)
        .where(
          and(
            eq(media.userId, session.user.id),
            eq(identifier, externalId)
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
    const now = new Date();
    
    // 1. Fetch existing media to handle status progression logic
    const existingMedia = await db
      .select({ externalId: media.externalId, status: media.status })
      .from(media)
      .where(eq(media.userId, session.user.id));
    
    const existingMap = new Map(existingMedia.map(m => [m.externalId, m.status]));
    const STATUS_WEIGHTS: Record<string, number> = {
      "watchlist": 1,
      "shelf": 1,
      "progress": 2,
      "completed": 3,
      "loved": 4
    };

    const toInsert = [];
    const toUpdate = [];

    for (const item of items) {
      if (!item.matchedId || item.matchedId === "not-found") continue;
      
      const currentStatus = existingMap.get(item.matchedId);
      const newStatus = item.status || "completed";
      
      const data = {
        userId: session.user.id,
        title: item.title,
        category: item.category,
        status: newStatus,
        type: item.type || (item.category === "read" ? "book" : "movie"),
        externalId: item.matchedId,
        posterUrl: item.posterUrl,
        backdropUrl: item.backdropUrl,
        tagline: item.tagline,
        subtitle: item.subtitle,
        description: item.description,
        creator: item.creator,
        genres: Array.isArray(item.genres) ? item.genres.join(', ') : item.genres,
        format: item.format,
        language: item.language,
        runtime: item.runtime,
        pageCount: item.pageCount,
        releaseYear: typeof item.year === 'string' ? parseInt(item.year) : item.year,
        isDocumentary: item.isDocumentary ? "true" : "false",
        watchlistedAt: (newStatus === "watchlist" || newStatus === "shelf") ? now : null,
        completedAt: (newStatus === "completed" || newStatus === "loved") ? now : null,
        favoritedAt: newStatus === "loved" ? now : null,
      };

      if (!currentStatus) {
        toInsert.push(data);
      } else {
        // Only update if the new status is "higher" on the ladder or if it's the same (to update metadata)
        const currentWeight = STATUS_WEIGHTS[currentStatus] || 0;
        const newWeight = STATUS_WEIGHTS[newStatus] || 0;
        
        if (newWeight >= currentWeight) {
          toUpdate.push(data);
        }
      }
    }

    // 2. Batch Insert new items
    if (toInsert.length > 0) {
      await db.insert(media).values(toInsert as any);
    }

    // 3. Batch Update existing items (Sequential for safety in server action)
    for (const item of toUpdate) {
      await db.update(media)
        .set(item)
        .where(and(eq(media.userId, session.user.id), eq(media.externalId, item.externalId)));
    }
    
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
      .where(and(eq(media.userId, session.user.id), ne(media.status, "none")));
    const items = userMedia.map(m => ({
      id: m.id,
      externalId: m.externalId,
      title: m.title,
      category: m.category,
      status: m.status,
      posterUrl: m.posterUrl,
      year: m.releaseYear,
      isDocumentary: m.isDocumentary === "true"
    }));
    
    return { success: true, items };
  } catch (error) {
    console.error("Failed to get user media:", error);
    return { success: false, items: {} };
  }
}

import { searchForMedia } from "@/lib/algorithms/media-searcher";

export async function searchMediaAction(query: string, category: "watch" | "read", year?: string, author?: string) {
  try {
    if (category === "watch") {
      const results = await searchMoviesForRematch(query, year);
      return { success: true, results };
    } else {
      const results = await searchBooksForRematch(query, author, year);
      return { success: true, results };
    }
  } catch (error) {
    console.error("Search media action failed:", error);
    return { success: false, results: [] };
  }
}

export interface MatchQuery {
  query: string;
  category: "watch" | "read";
  author?: string;
  isbn?: string;
  year?: string;
}

export async function matchMedia(q: MatchQuery) {
  const { category, query, author, isbn, year } = q;
  const titleOnly = query.trim();

  try {
    if (category === "watch") {
      return await matchWatchItem(titleOnly, year);
    } else {
      return await matchReadItem(titleOnly, author, isbn, year);
    }
  } catch (error) {
    console.error(`[Matcher] Failed to match ${query}:`, error);
    return null;
  }
}

export async function batchSearchMediaAction(queries: MatchQuery[]) {
  try {
    // Process the entire batch with a small staggered delay to respect rate limits
    const results = await Promise.all(
      queries.map(async (q, i) => {
        if (i > 0) await new Promise(r => setTimeout(r, i * 100));
        return matchMedia(q);
      })
    );
    
    return { success: true, results };
  } catch (error) {
    console.error("Batch search failed:", error);
    return { success: false, results: [] };
  }
}
