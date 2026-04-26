"use server";

import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function logMediaAction(formData: {
  mediaId?: string; // Internal UUID
  mediaData: {
    title: string;
    category: "watch" | "read" | "play";
    subType: string;
    posterUrl: string;
    year: number;
    creator: string;
    slug: string;
  };
  logData: {
    rating: number;
    isLiked: boolean;
    reviewText: string;
    progress?: number;
    loggedDate: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Ensure the Media item exists in our DB
  let targetMediaId = formData.mediaId;

  if (!targetMediaId) {
    const existing = await db.query.media.findFirst({
      where: eq(media.slug, formData.mediaData.slug),
    });

    if (existing) {
      targetMediaId = existing.id;
    } else {
      const [newMedia] = await db.insert(media).values({
        title: formData.mediaData.title,
        type: formData.mediaData.subType,
        category: formData.mediaData.category,
        posterUrl: formData.mediaData.posterUrl,
        releaseYear: formData.mediaData.year,
        year: formData.mediaData.year,
        creator: formData.mediaData.creator,
        slug: formData.mediaData.slug,
        externalId: `manual_${Date.now()}`,
        status: "completed",
        rating: formData.logData.rating,
        reviewText: formData.logData.reviewText,
        completedAt: formData.logData.loggedDate,
      }).returning();
      targetMediaId = newMedia.id;
    }
  } else {
    // Update existing media status
    await db.update(media)
      .set({
        status: "completed",
        rating: formData.logData.rating,
        reviewText: formData.logData.reviewText,
        completedAt: formData.logData.loggedDate,
        updatedAt: new Date(),
      })
      .where(eq(media.id, targetMediaId));
  }

  // 2. Create the Log entry
  await db.insert(logs).values({
    mediaId: targetMediaId!,
    date: formData.logData.loggedDate,
    action: "finished",
    progress: formData.logData.progress || null,
    notes: formData.logData.reviewText,
  });

  revalidatePath("/");
  revalidatePath(`/${formData.mediaData.category}`);
  revalidatePath(`/items/${targetMediaId}`);
  
  return { success: true };
}
