"use server";

import { db } from "@/lib/db";
import { media, diaryEntries, trackingEntries } from "@/lib/db/schema";
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
        ...formData.mediaData,
      }).returning();
      targetMediaId = newMedia.id;
    }
  }

  // 2. Create the Diary Entry
  await db.insert(diaryEntries).values({
    userId: session.user.id,
    mediaId: targetMediaId!,
    loggedDate: formData.logData.loggedDate,
    rating: formData.logData.rating.toString(),
    reviewText: formData.logData.reviewText,
    isLiked: formData.logData.isLiked,
  });

  // 3. Update Tracking Status (e.g. mark as completed or update progress)
  const existingTracking = await db.query.trackingEntries.findFirst({
    where: and(
      eq(trackingEntries.userId, session.user.id),
      eq(trackingEntries.mediaId, targetMediaId!)
    ),
  });

  if (existingTracking) {
    await db.update(trackingEntries)
      .set({
        status: "completed",
        rating: formData.logData.rating.toString(),
        isLiked: formData.logData.isLiked,
        progress: formData.logData.progress || existingTracking.progress,
        updatedAt: new Date(),
      })
      .where(eq(trackingEntries.id, existingTracking.id));
  } else {
    await db.insert(trackingEntries).values({
      userId: session.user.id,
      mediaId: targetMediaId!,
      status: "completed",
      rating: formData.logData.rating.toString(),
      isLiked: formData.logData.isLiked,
      progress: formData.logData.progress,
    });
  }

  revalidatePath("/");
  revalidatePath(`/${formData.mediaData.category}`);
  revalidatePath(`/${formData.mediaData.category}/${formData.mediaData.slug}`);
  
  return { success: true };
}
