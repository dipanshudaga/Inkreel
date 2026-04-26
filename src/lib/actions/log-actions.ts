"use server";

import { db } from "@/lib/db";
import { logs, media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addQuickLog(formData: FormData) {
  const mediaId = formData.get("mediaId") as string;
  const progress = parseInt(formData.get("progress") as string);
  const notes = formData.get("notes") as string;

  if (!mediaId) return { error: "Media ID is required" };

  await db.insert(logs).values({
    mediaId,
    progress,
    notes,
    date: new Date().toISOString(),
    action: "progress_update",
  });

  // Update the media's updatedAt timestamp
  await db.update(media).set({ updatedAt: new Date() }).where(eq(media.id, mediaId));

  revalidatePath("/watch");
  revalidatePath("/read");
  revalidatePath(`/items/${mediaId}`);
  
  return { success: true };
}
