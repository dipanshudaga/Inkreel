"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addToArchive(itemData: any) {
  try {
    const externalId = itemData.id;
    
    // Ensure we don't have duplicates by checking externalId
    const existing = await db.query.media.findFirst({
      where: eq(media.externalId, externalId),
    });

    if (existing) {
      return { success: true, message: "Item already in archive" };
    }

    const [newItem] = await db.insert(media).values({
      externalId: externalId,
      type: itemData.type,
      title: itemData.title,
      posterUrl: itemData.posterUrl,
      releaseYear: itemData.year,
      creator: itemData.creator,
      description: itemData.description,
      status: 'planned',
      rating: 0,
      runtime: itemData.runtime || 0,
      genres: Array.isArray(itemData.genres) ? itemData.genres.join(", ") : "",
      updatedAt: new Date(),
    }).returning();

    revalidatePath("/watch");
    revalidatePath("/read");
    revalidatePath(`/items/${newItem.id}`);

    return { success: true, id: newItem.id };
  } catch (error) {
    console.error("Add to Archive Error:", error);
    return { success: false, error: "Failed to add item to archive" };
  }
}
