"use server";

import { searchTMDB, getTrendingWatch } from "@/lib/api/tmdb";
import { searchGoogleBooks, getTrendingBooks } from "@/lib/api/google-books";
import { searchBGG, getTrendingGames } from "@/lib/api/bgg";

export async function searchMediaAction(query: string) {
  try {
    // Run searches as independent settlements
    const results = await Promise.allSettled([
      searchTMDB(query),
      searchGoogleBooks(query),
      searchBGG(query),
    ]);

    const flattenedResults = results
      .filter((res): res is PromiseFulfilledResult<any[]> => res.status === "fulfilled")
      .flatMap(res => res.value);
    
    return { success: true, results: flattenedResults };
  } catch (error) {
    console.error("Search Server Action Error:", error);
    return { success: false, error: "Failed to perform search" };
  }
}

export async function loadMoreAction(category: "watch" | "read" | "play", page: number) {
  try {
    let results: any[] = [];
    if (category === "watch") {
      results = await getTrendingWatch(page);
    } else if (category === "read") {
      // Index is typically (page-1) * 20
      results = await getTrendingBooks((page - 1) * 20);
    } else if (category === "play") {
      // Hot list doesn't paginate well, maybe skip for now or just return empty
      results = [];
    }
    return { success: true, results };
  } catch (error) {
    console.error("Load More Action Error:", error);
    return { success: false, error: "Failed to load more items" };
  }
}
