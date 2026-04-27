"use server";

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addToArchive(itemData: any) {
  try {
    const id = itemData.id;
    
    // Ensure we don't have duplicates
    const existing = await db.query.media.findFirst({
      where: (media, { eq }) => eq(media.id, id),
    });

    if (existing) {
      return { success: true, message: "Item already in archive" };
    }

    await db.insert(media).values({
      id: itemData.id,
      type: itemData.subType,
      title: itemData.title,
      posterUrl: itemData.posterUrl,
      releaseYear: itemData.year,
      creator: itemData.creator,
      description: itemData.description,
      status: 'planned', // Default status
      rating: 0,
      runtime: itemData.runtime || 0,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/watch");
    revalidatePath("/read");
    revalidatePath(`/items/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Add to Archive Error:", error);
    return { success: false, error: "Failed to add item to archive" };
  }
}
