import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { count, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const watchCount = await db
    .select({ value: count() })
    .from(media)
    .where(or(
      eq(media.type, "movie"),
      eq(media.type, "tv"),
      eq(media.type, "anime")
    ));

  const readCount = await db
    .select({ value: count() })
    .from(media)
    .where(or(
      eq(media.type, "book"),
      eq(media.type, "manga")
    ));

  return NextResponse.json({
    watch: watchCount[0].value,
    read: readCount[0].value,
  });
}
