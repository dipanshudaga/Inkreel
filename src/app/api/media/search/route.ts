import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { searchMediaAction } from "@/lib/actions/search";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  
  if (!query) {
    return NextResponse.json([]);
  }

  let localResults: any[] = [];
  try {
    localResults = await db.query.media.findMany({
      where: or(
        ilike(media.title, `%${query}%`),
        ilike(media.creator, `%${query}%`)
      ),
      limit: 10,
    });
  } catch (err) {
    console.error("Local search failed:", err);
  }

  // 2. Search Global (TMDB, Books, etc)
  let globalResults: any[] = [];
  try {
    const searchResponse = await searchMediaAction(query);
    globalResults = searchResponse.results || [];
  } catch (err) {
    console.error("Global search failed:", err);
  }
  
  // 3. Merge and Normalize results
  const localMap = new Map(localResults.map(r => [r.externalId, r]));
  
  const normalizedGlobal = (globalResults || []).map(g => {
    // If we already have this in our DB, use the local data but keep it formatted for search
    if (localMap.has(g.id)) {
      const local = localMap.get(g.id);
      return {
        id: local.id,
        externalId: local.externalId,
        title: local.title,
        type: local.type,
        year: local.releaseYear?.toString(),
        posterUrl: local.posterUrl,
        creator: local.creator,
        status: local.status === "none" ? null : local.status,
      };
    }
    return g;
  });

  // Filter out any global results that are now duplicates of local results (already in normalizedGlobal)
  const localExternalIds = new Set(localResults.map(r => r.externalId));
  const uniqueGlobal = normalizedGlobal.filter(g => !localExternalIds.has(g.id) || localMap.has(g.id));

  // Also include any local results that weren't in the global search (e.g. niche items already in diary)
  const globalIds = new Set(uniqueGlobal.map(g => g.id));
  const missingLocal = localResults
    .filter(l => !globalIds.has(l.id))
    .map(l => ({
      id: l.id,
      externalId: l.externalId,
      title: l.title,
      type: l.type,
      year: l.releaseYear?.toString(),
      posterUrl: l.posterUrl,
      creator: l.creator,
      status: l.status,
    }));

  const allResults = [...uniqueGlobal, ...missingLocal];
  
  // Final Deduplication by ID
  const seenIds = new Set();
  const finalResults = allResults.filter(r => {
    if (!r || !r.id) return false;
    if (seenIds.has(r.id)) return false;
    seenIds.add(r.id);
    return true;
  });

  return NextResponse.json(finalResults);
}
