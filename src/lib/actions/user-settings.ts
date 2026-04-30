"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }

    if (username) {
      // Check if username is taken
      const [existing] = await db.select().from(users).where(eq(users.username, username));
      if (existing && existing.id !== session.user.id) {
        return { error: "Username already taken" };
      }
      updateData.username = username;
    }

    if (newPassword) {
      if (newPassword.length < 6) return { error: "Password must be at least 6 characters" };
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) return { error: "No changes specified" };

    await db.update(users).set(updateData).where(eq(users.id, session.user.id));
    
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}

export async function updateAestheticsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const theme = formData.get("theme") as string;
  const fontPreference = formData.get("fontPreference") as string;

  try {
    await db.update(users).set({ theme, fontPreference }).where(eq(users.id, session.user.id));
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Aesthetics update error:", error);
    return { error: "Failed to update aesthetics" };
  }
}

export async function updateGoalsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const movieGoal = parseInt(formData.get("movieGoal") as string) || 0;
  const bookGoal = parseInt(formData.get("bookGoal") as string) || 0;

  try {
    await db.update(users).set({ movieGoal, bookGoal }).where(eq(users.id, session.user.id));
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    console.error("Goals update error:", error);
    return { error: "Failed to update goals" };
  }
}

export async function getCurrentUserAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    return { success: true, user };
  } catch (error) {
    return { error: "Failed to fetch user" };
  }
}
export async function purgeDiaryAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const { media } = await import("@/lib/db/schema");
    await db.delete(media).where(eq(media.userId, session.user.id));
    revalidatePath("/account");
    revalidatePath("/watch");
    revalidatePath("/read");
    return { success: true };
  } catch (error) {
    console.error("Purge error:", error);
    return { error: "Failed to purge diary" };
  }
}
