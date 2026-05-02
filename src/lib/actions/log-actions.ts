"use server";

import { db } from "@/lib/db";
import { logs, media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function addQuickLog(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const mediaId = formData.get("mediaId") as string;
  const progress = parseInt(formData.get("progress") as string);
  const notes = formData.get("notes") as string;

  if (!mediaId) return { error: "Media ID is required" };

  await db.insert(logs).values({
    userId: session.user.id,
    mediaId,
    progress,
    notes,
    date: new Date().toISOString(),
    action: "progress_update",
  });

  revalidatePath("/watch");
  revalidatePath("/read");
  revalidatePath(`/items/${mediaId}`);
  
  return { success: true };
}
