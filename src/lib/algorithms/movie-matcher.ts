import { searchMovies } from "@/lib/api/tmdb";

export async function matchWatchItem(title: string, year?: string) {
  // Pass 1: Title + Year param (Most accurate)
  let movies = await searchMovies(title, year);
  if (movies.length > 0) return movies[0];

  // Pass 2: Combined query
  movies = await searchMovies(`${title} ${year || ""}`.trim());
  if (movies.length > 0) return movies[0];

  // Pass 3: Title only (Fallback to most popular)
  movies = await searchMovies(title);
  if (movies.length > 0) return movies[0];

  return null;
}
