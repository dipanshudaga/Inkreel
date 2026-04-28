"use server";

import { searchMovies, getTrendingWatch } from "@/lib/api/tmdb";
import { searchBooks, getTrendingBooks } from "@/lib/api/google-books";
import { searchAniList } from "@/lib/api/anilist";

export async function searchMediaAction(query: string) {
  try {
    // Run searches as independent settlements
    const results = await Promise.allSettled([
      searchMovies(query),
      searchBooks(query),
      searchAniList(query, "ANIME"),
      searchAniList(query, "MANGA"),
    ]);

    const flattenedResults = results
      .filter((res): res is PromiseFulfilledResult<any[]> => res.status === "fulfilled")
      .flatMap(res => res.value);
    
    console.log(`Search for "${query}": Found ${flattenedResults.length} raw results`);
    
    // Relevance filtering and scoring
    const q = query.toLowerCase().trim();
    const qWords = q.split(/\s+/).filter(w => w.length > 1);

    const filteredResults = flattenedResults.filter(item => {
      const title = (item.title || "").toLowerCase();
      const creator = (item.creator || "").toLowerCase();
      const combined = `${title} ${creator}`;
      
      // Strict check for very short queries
      if (q.length <= 3) return title.startsWith(q) || creator.startsWith(q);

      // Must contain the full query string OR all significant words
      return combined.includes(q) || (qWords.length > 0 && qWords.every(word => combined.includes(word)));
    });

    // Sort by match quality
    const sortedResults = filteredResults.sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const aCreator = (a.creator || "").toLowerCase();
      const bCreator = (b.creator || "").toLowerCase();

      // Priority 1: Exact title match
      if (aTitle === q && bTitle !== q) return -1;
      if (bTitle === q && aTitle !== q) return 1;

      // Priority 2: Title starts with query
      if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1;
      if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1;

      // Priority 3: Creator match
      if ((aCreator === q || aCreator.includes(q)) && !(bCreator === q || bCreator.includes(q))) return -1;
      if ((bCreator === q || bCreator.includes(q)) && !(aCreator === q || aCreator.includes(q))) return 1;

      return 0;
    });
    
    return { success: true, results: sortedResults };
  } catch (error) {
    console.error("Search Server Action Error:", error);
    return { success: false, error: "Failed to perform search" };
  }
}

export async function loadMoreAction(category: "watch" | "read", page: number) {
  try {
    let results: any[] = [];
    if (category === "watch") {
      results = await getTrendingWatch(page);
    } else if (category === "read") {
      // Index is typically (page-1) * 20
      results = await getTrendingBooks((page - 1) * 20);
    }
    return { success: true, results };
  } catch (error) {
    console.error("Load More Action Error:", error);
    return { success: false, error: "Failed to load more items" };
  }
}
