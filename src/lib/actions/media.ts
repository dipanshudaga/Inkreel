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
      await db.delete(media).where(
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
    const values = items.map(item => ({
      userId: session.user.id,
      title: item.title,
      category: item.category,
      status: item.status,
      externalId: item.externalId,
      posterUrl: item.posterUrl,
      releaseYear: item.year,
      watchlistedAt: (item.status === "watchlist" || item.status === "shelf") ? now : null,
      completedAt: (item.status === "completed" || item.status === "loved") ? now : null,
      favoritedAt: item.status === "loved" ? now : null,
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
    const results = await searchForMedia(query, category, year, author);
    return { success: true, results };
  } catch (error) {
    console.error("Search media action failed:", error);
    return { success: false, results: [] };
  }
}

import { matchMedia, MatchQuery } from "@/lib/algorithms/media-matcher";

export async function batchSearchMediaAction(queries: MatchQuery[]) {
  try {
    const results: any[] = [];
    for (let i = 0; i < queries.length; i++) {
      const result = await matchMedia(queries[i]);
      results.push(result);
      
      // Small staggered delay to prevent rate-limiting or concurrency issues
      if (i < queries.length - 1) await new Promise(r => setTimeout(r, 200));
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("Batch search failed:", error);
    return { success: false, results: [] };
  }
}
