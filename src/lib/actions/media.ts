"use server";

import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

export async function saveMediaAction(externalId: string, status: string, rating?: number | null) {
  try {
    // 1. Fetch full details if we only have the external ID
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

    // 2. Map status to DB values
    // watched -> completed
    // watchlist -> plan_to_watch / plan_to_read
    const dbStatus = status === "watched" ? "completed" : 
                     (itemData.category === "read" ? "plan_to_read" : "plan_to_watch");

    // 3. Insert into DB
    const [newMedia] = await db.insert(media).values({
      externalId: externalId,
      title: itemData.title,
      category: itemData.category,
      type: itemData.type,
      posterUrl: itemData.posterUrl,
      backdropUrl: itemData.backdropUrl,
      releaseYear: itemData.releaseYear || itemData.year,
      creator: itemData.creator,
      genres: Array.isArray(itemData.genres) ? itemData.genres.join(", ") : (itemData.genres || ""),
      runtime: itemData.runtime,
      description: itemData.description,
      status: dbStatus,
      rating: rating || null,
      completedAt: status === "watched" ? new Date().toISOString() : null,
    }).returning();

    // 4. Create initial log
    await db.insert(logs).values({
      mediaId: newMedia.id,
      date: new Date().toISOString(),
      action: status === "watched" ? "finished" : "added",
      notes: status === "watched" ? "Manually added to archive." : "Added to watchlist.",
    });

    revalidatePath("/");
    revalidatePath(`/${itemData.category}`);
    
    return { success: true, id: newMedia.id };
  } catch (error) {
    console.error("Save media failed:", error);
    return { success: false, error: "Failed to save to archive" };
  }
}
