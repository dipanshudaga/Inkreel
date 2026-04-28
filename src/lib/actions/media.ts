"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

export async function saveMediaAction(externalId: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // 1. Fetch full details
    let itemData: any = null;
    if (externalId.startsWith("tmdb-movie-")) {
      itemData = await getMovieById(externalId.replace("tmdb-movie-", ""));
    } else if (externalId.startsWith("tmdb-tv-")) {
      itemData = await getTVById(externalId.replace("tmdb-tv-", ""));
    } else if (externalId.startsWith("gb-")) {
      itemData = await getBookById(externalId.replace("gb-", ""));
    } else if (externalId.startsWith("anilist-")) {
      itemData = await getAniListById(parseInt(externalId.replace("anilist-", ""), 10));
    }

    if (!itemData) throw new Error("Could not fetch media data");

    // 2. Map language code to name
    let languageName = "Unknown";
    try {
      if (itemData.languageCode) {
        languageName = languageNames.of(itemData.languageCode) || "Unknown";
      }
    } catch (e) {}

    // 3. Status mapping
    let dbStatus = status;
    if (status === "watched" || status === "read") dbStatus = "completed";
    if (status === "love") dbStatus = "loved";
    if (status === "watchlist" && itemData.category === "read") dbStatus = "shelf";

    // 4. Insert into DB
    const [newMedia] = await db.insert(media).values({
      userId: session.user.id,
      externalId: externalId,
      title: itemData.title,
      tagline: itemData.tagline,
      subtitle: itemData.subtitle,
      category: itemData.category,
      type: itemData.type,
      format: itemData.format,
      creator: itemData.creator,
      genres: Array.isArray(itemData.genres) ? itemData.genres.join(", ") : (itemData.genres || ""),
      language: languageName,
      releaseYear: itemData.releaseYear || itemData.year,
      runtime: itemData.runtime,
      pageCount: itemData.pageCount,
      posterUrl: itemData.posterUrl,
      backdropUrl: itemData.backdropUrl,
      description: itemData.description,
      status: dbStatus,
    }).returning();

    revalidatePath("/", "layout");
    return { success: true, id: newMedia.id };
  } catch (error) {
    console.error("Save media failed:", error);
    return { success: false, error: "Failed to save to archive" };
  }
}

export async function updateMediaAction(id: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Status mapping
    let dbStatus = status;
    if (status === "watched" || status === "read") dbStatus = "completed";
    if (status === "love") dbStatus = "loved";
    // We don't handle "watchlist" vs "shelf" here because we don't know the category easily without fetching
    // But updateAction usually receives the correct string from the UI
    
    await db.update(media)
      .set({ status: dbStatus })
      .where(and(eq(media.id, id), eq(media.userId, session.user.id)));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update media failed:", error);
    return { success: false, error: "Failed to update archive" };
  }
}

export async function deleteMediaAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(media)
      .where(and(eq(media.id, id), eq(media.userId, session.user.id)));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Delete media failed:", error);
    return { success: false, error: "Failed to delete" };
  }
}
