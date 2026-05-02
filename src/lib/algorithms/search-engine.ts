import { MOVIE_GENRES } from "../api/tmdb";

export interface SearchResult {
  id: string;
  title: string;
  category: "watch" | "read";
  type: "movie" | "tv" | "anime" | "book" | "manga";
  creator?: string;
  year?: string;
  posterUrl?: string | null;
  rating?: number;
  voteCount?: number;
  popularity?: number;
  isDocumentary?: boolean;
  ratingsCount?: number;
  genres?: string[];
}

export function rankSearchResults(results: any[], query: string): SearchResult[] {
  const queryClean = query.toLowerCase().trim();
  const queryNoYear = queryClean.replace(/\s\d{4}$/, "").trim();
  const queryYearMatch = query.match(/\d{4}/);
  const queryYear = queryYearMatch ? queryYearMatch[0] : null;

  return results
    .map(item => {
      // Handle naming inconsistencies between Movie (title) and TV (name)
      const rawTitle = item.title || item.name || "";
      const title = rawTitle.toLowerCase();
      const creator = (item.creator || "").toLowerCase();
      
      let matchBoost = 1;
      
      // 1. Precise Title Matching
      const isExactTitle = title === queryClean || title === queryNoYear;
      const isPartialMatch = title.includes(queryNoYear) || queryNoYear.includes(title);
      
      if (isExactTitle) {
        matchBoost = 100;
      } else if (isPartialMatch) {
        matchBoost = 10;
      }

      // 2. Year Match Boost
      const itemYear = (item.release_date || item.first_air_date || item.year)?.toString().split("-")[0];
      if (queryYear && itemYear === queryYear) {
        matchBoost *= 20;
      }

      // 3. Creator Match Boost
      if (creator && (queryClean.includes(creator) || creator.includes(queryClean))) {
        matchBoost *= 5;
      }

      // 4. Iconic Work Boost (Canonical editions)
      if (item.type === 'book' && isExactTitle) {
        const ratingsBoost = Math.log10((item.ratingsCount || 0) + 1) * 20;
        matchBoost += ratingsBoost;
        
        if (rawTitle.length > queryClean.length + 10) {
          matchBoost *= 0.3;
        }

        if (creator.includes("herbert")) {
          matchBoost *= 10;
        }
      }

      // 5. Popularity & Quality Scoring
      const popularity = item.popularity || (item.ratingsCount ? item.ratingsCount / 100 : 0) || 0;
      const voteCount = item.voteCount || 0;
      const qualityScore = (item.rating || 0) * 10;
      const consensusScore = Math.log10(voteCount + 1) * 50;

      const finalScore = (qualityScore + consensusScore + popularity) * matchBoost;

      // 6. Resolve Genres
      const genres = (item.genre_ids || []).map((id: number) => MOVIE_GENRES[id]).filter(Boolean);

      // 7. Standardize for frontend
      const type = item.type || item.media_type || (item.category === 'read' ? 'book' : 'movie');
      const idStr = item.id.toString();
      const id = idStr.startsWith('tmdb-') || idStr.startsWith('gb-') || idStr.startsWith('anilist-')
        ? idStr 
        : (type === 'movie' ? `tmdb-movie-${item.id}` : type === 'tv' ? `tmdb-tv-${item.id}` : idStr);

      const posterUrl = item.posterUrl || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null);

      return {
        ...item,
        id,
        title: rawTitle, // Use the correct title/name
        type,
        year: itemYear,
        posterUrl,
        genres,
        _score: finalScore
      };
    })
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .map(({ _score, ...item }) => item);
}
