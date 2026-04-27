import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { searchMediaAction } from "@/lib/actions/search";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  
  if (!query) {
    return NextResponse.json([]);
  }

  // 1. Search local DB
  const localResults = await db.query.media.findMany({
    where: or(
      like(media.title, `%${query}%`),
      like(media.creator, `%${query}%`)
    ),
    limit: 5,
  });

  // 2. Search Global (TMDB, Books, etc)
  const { results: globalResults } = await searchMediaAction(query);
  
  // 3. Merge results (prioritize local)
  const localIds = new Set(localResults.map(r => r.id));
  const uniqueGlobal = (globalResults || []).filter(g => !localIds.has(g.id));

  return NextResponse.json([...localResults, ...uniqueGlobal]);
}
