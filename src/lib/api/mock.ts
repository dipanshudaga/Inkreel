import { getMovieById, getTVById, searchMovies, getTrendingWatch } from "./tmdb";
import { getBookById, searchBooks, getTrendingBooks, MOCK_BOOKS } from "./google-books";

export interface MediaItem {
  id: string;
  category: "watch" | "read";
  type: string;
  title: string;
  slug: string;
  posterUrl: string;
  backdropUrl?: string;
  year: number | null;
  creator: string;
  description: string;
  genres: string[];
  rating?: number;
  runtime?: number;
  duration?: number;
  pageCount?: number;
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  if (!query) return [];

  const [movies, books] = await Promise.all([
    searchMovies(query),
    searchBooks(query),
  ]);

  // Merge with mocks for local visibility
  const mockBooks = MOCK_BOOKS.filter(b => b.title.toLowerCase().includes(query.toLowerCase()));

  return [...movies, ...books, ...mockBooks] as MediaItem[];
}

export async function getTrendingMedia(): Promise<MediaItem[]> {
  const [watch, books] = await Promise.all([
    getTrendingWatch(),
    getTrendingBooks(),
  ]);

  return [...watch, ...books] as MediaItem[];
}

import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getMediaBySlug(slugOrId: string, category?: string): Promise<MediaItem | undefined | null> {
  // 1. Check if slugOrId is an ID format first
  if (slugOrId.startsWith("tmdb-movie-")) {
    const id = slugOrId.replace("tmdb-movie-", "");
    return (await getMovieById(id)) as MediaItem;
  }
  if (slugOrId.startsWith("tmdb-tv-")) {
    const id = slugOrId.replace("tmdb-tv-", "");
    return (await getTVById(id)) as MediaItem;
  }
  
  // Detect legacy slug format: movie-{id}-{slug} or tv-{id}-{slug}
  const legacyMatch = slugOrId.match(/^(movie|tv)-(\d+)-/);
  if (legacyMatch) {
    const type = legacyMatch[1];
    const id = legacyMatch[2];
    if (type === "movie") return (await getMovieById(id)) as MediaItem;
    if (type === "tv") return (await getTVById(id)) as MediaItem;
  }

  if (slugOrId.startsWith("gb-")) {
    const id = slugOrId.replace("gb-", "");
    return (await getBookById(id)) as MediaItem;
  }
  if (slugOrId.startsWith("anilist-")) {
    const id = parseInt(slugOrId.replace("anilist-", ""));
    const { getAniListById } = await import("./anilist");
    return (await getAniListById(id)) as unknown as MediaItem;
  }

  // 2. Check Local DB
  const dbMatch = await db.query.media.findFirst({
    where: category 
      ? and(eq(media.category, category), eq(media.title, slugOrId.replace(/-/g, " ")))
      : eq(media.title, slugOrId.replace(/-/g, " ")),
  });

  if (dbMatch) {
    return {
      ...dbMatch,
      genres: dbMatch.genres ? dbMatch.genres.split(",") : [],
    } as any;
  }

  // 3. Check Mocks
  const mockBook = MOCK_BOOKS.find(b => b.slug === slugOrId || b.id === slugOrId);
  if (mockBook && (!category || category === "read")) return mockBook as MediaItem;

  // 4. Fallback to API search resolution
  const query = slugOrId.replace(/-/g, " ");

  if (category === "watch") {
    const results = await searchMovies(query);
    if (results.length === 0) return null;
    return (results as MediaItem[]).find(r => r.title.toLowerCase() === query.toLowerCase()) || 
           results[0];
  }

  if (category === "read") {
    const results = await searchBooks(query);
    if (results.length === 0) return null;
    return (results as MediaItem[]).find(r => r.title.toLowerCase() === query.toLowerCase()) || results[0];
  }

  const results = await searchMedia(query);
  if (results.length === 0) return null;
  return results[0];
}
