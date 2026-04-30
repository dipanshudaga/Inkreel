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
  const externalToLocal = new Map(localResults.map(r => [r.externalId, r.id]));
  
  const uniqueGlobal = (globalResults || []).map(g => {
    // Standardize 'type' for the frontend
    const normalized = { ...g };

    // If we already have this in our DB, use the local UUID instead of the external string
    if (externalToLocal.has(g.id)) {
      const local = localResults.find(l => l.externalId === g.id);
      return { ...local, status: local?.status || 'archived' };
    }
    return normalized;
  });

  // Filter out any global results that are now duplicates of local results (already covered by map)
  const localIds = new Set(localResults.map(r => r.id));
  const filteredGlobal = uniqueGlobal.filter(g => !localIds.has(g.id));

  const allResults = [...localResults, ...filteredGlobal];
  
  // Final safeguard: Deduplicate by ID one last time in case global results had duplicates
  const seenIds = new Set();
  const finalResults = allResults.filter(r => {
    if (seenIds.has(r.id)) return false;
    seenIds.add(r.id);
    return true;
  });

  return NextResponse.json(finalResults);
}
