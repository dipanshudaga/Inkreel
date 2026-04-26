import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const results = await db.query.media.findMany({
    where: or(
      eq(media.status, "watching"),
      eq(media.status, "reading")
    ),
    orderBy: (media, { desc }) => [desc(media.updatedAt)],
  });
  
  return NextResponse.json(results);
}
