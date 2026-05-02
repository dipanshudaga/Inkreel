import { searchBooks } from "@/lib/api/google-books";

export async function searchBooksForRematch(query: string, author?: string, year?: string) {
  try {
    // Clean title: Strip series info like "(Dune Chronicles Book 1)" or ": Subtitle"
    const cleanQuery = query.replace(/\s*\(.*?\)\s*/g, " ").replace(/:.*$/, "").trim();
    
    let results = await searchBooks(cleanQuery || query, author, year);

    // Fallback: If no results with author/year, try just the cleaned title
    if (results.length === 0 && (author || year)) {
      results = await searchBooks(cleanQuery || query);
    }

    return results;
  } catch (error) {
    console.error("[Book Searcher] Discovery failed:", error);
    return [];
  }
}
