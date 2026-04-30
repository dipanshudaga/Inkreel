import { searchMovies } from "@/lib/api/tmdb";
import { searchBooks } from "@/lib/api/google-books";

export async function searchForMedia(query: string, category: "watch" | "read", year?: string, author?: string) {
  try {
    if (category === "watch") {
      let results = await searchMovies(query, year);
      
      // Fallback: If no results and query looks like it has a year, try stripping it
      if (results.length === 0 && query.match(/\d{4}\s*$/)) {
        const titleOnly = query.replace(/\s\d{4}\s*$/, "").trim();
        const extractedYear = query.match(/\d{4}\s*$/)?.[0].trim();
        results = await searchMovies(titleOnly, extractedYear);
      }
      
      // If still no results, try just the title
      if (results.length === 0 && query.match(/\d{4}\s*$/)) {
        const titleOnly = query.replace(/\s\d{4}\s*$/, "").trim();
        results = await searchMovies(titleOnly);
      }
      
      return results;
    } else {
      let results = await searchBooks(query, author, year);

      // Fallback: If no results and query looks like it has a year, try stripping it
      if (results.length === 0 && query.match(/\d{4}\s*$/)) {
        const titleOnly = query.replace(/\s\d{4}\s*$/, "").trim();
        results = await searchBooks(titleOnly, author);
      }

      return results;
    }
  } catch (error) {
    console.error("[Searcher] Discovery failed:", error);
    return [];
  }
}
