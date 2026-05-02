import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { count, eq, or, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ watch: 0, read: 0 });
    }
    const userId = session.user.id;

    const watchCount = await db
      .select({ value: count() })
      .from(media)
      .where(and(
        eq(media.userId, userId),
        or(
          eq(media.type, "movie"),
          eq(media.type, "tv"),
          eq(media.type, "anime")
        )
      ));

    const readCount = await db
      .select({ value: count() })
      .from(media)
      .where(and(
        eq(media.userId, userId),
        or(
          eq(media.type, "book"),
          eq(media.type, "manga")
        )
      ));

    return NextResponse.json({
      watch: watchCount[0].value,
      read: readCount[0].value,
    });
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    return NextResponse.json({ watch: 0, read: 0 });
  }
}
