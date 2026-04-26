import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  
  if (!query) {
    return NextResponse.json([]);
  }

  const results = await db.query.media.findMany({
    where: or(
      like(media.title, `%${query}%`),
      like(media.creator, `%${query}%`)
    ),
    limit: 10,
  });
  
  return NextResponse.json(results);
}
