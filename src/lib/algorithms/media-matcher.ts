import { searchMovies } from "@/lib/api/tmdb";
import { searchBooks } from "@/lib/api/google-books";

export interface MatchQuery {
  query: string;
  category: "watch" | "read";
  author?: string;
  isbn?: string;
  year?: string;
}

export async function matchMedia(q: MatchQuery) {
  const { category, query, author, isbn, year } = q;
  const titleOnly = query.trim();

  try {
    if (category === "watch") {
      return await matchWatchItem(titleOnly, year);
    } else {
      return await matchReadItem(titleOnly, author, isbn, year);
    }
  } catch (error) {
    console.error(`[Matcher] Failed to match ${query}:`, error);
    return null;
  }
}

async function matchWatchItem(title: string, year?: string) {
  // Pass 1: Title + Year param
  let movies = await searchMovies(title, year);
  if (movies.length > 0) return movies[0];

  // Pass 2: Combined query
  movies = await searchMovies(`${title} ${year || ""}`.trim());
  if (movies.length > 0) return movies[0];

  // Pass 3: Title only
  movies = await searchMovies(title);
  if (movies.length > 0) return movies[0];

  return null;
}

async function matchReadItem(title: string, author?: string, isbn?: string, year?: string) {
  let isbnResult = null;
  let searchResult = null;

  // 1. Try ISBN Match
  if (isbn) {
    const books = await searchBooks(isbn);
    if (books.length > 0) isbnResult = books[0];
  }

  // 2. Try Title + Author Match (Structured)
  if (author) {
    const books = await searchBooks(title, author);
    if (books.length > 0) {
      // Find the best match in the list (most ratings + title similarity)
      const matches = books.filter(b => 
        b.title.toLowerCase().includes(title.toLowerCase()) || 
        title.toLowerCase().includes(b.title.toLowerCase())
      );
      searchResult = matches[0] || books[0];
    }
  }

  // 3. Choice Logic: If we have both, prefer the one with a better image/popularity
  // Usually, a Title+Author search returns the most 'popular' edition first, 
  // which has the better cover art.
  if (searchResult && isbnResult) {
    // If the ISBN result is a scan (often seen in old/niche editions), prefer the search result
    const isScan = isbnResult.posterUrl?.includes("curl") || !isbnResult.posterUrl;
    if (isScan && searchResult.posterUrl) return searchResult;
    
    // Otherwise, the ISBN is more 'accurate' to the user's specific copy
    return isbnResult;
  }

  return isbnResult || searchResult || null;
}
