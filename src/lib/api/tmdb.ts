import { rankSearchResults } from "../algorithms/search-engine";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const MOVIE_GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics"
};

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}, options: RequestInit = {}, retries = 2) {
  const apiKey = process.env.TMDB_API_KEY;
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  
  const urlParams = new URLSearchParams({
    ...params,
  });
  // Fallback to API key if no access token
  if (!accessToken) {
    urlParams.set("api_key", apiKey || "");
  }

  const url = `${TMDB_BASE_URL}${endpoint}?${urlParams.toString()}`;
  
  const headers: Record<string, string> = {
    accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[TMDB] Error ${res.status} on ${endpoint}: ${text}`);
      return { results: [] };
    }

    return res.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[TMDB] Fetch failed, retrying... (${retries} left)`);
      return tmdbFetch(endpoint, params, options, retries - 1);
    }
    console.error(`[TMDB] Fetch failed after retries:`, error);
    return { results: [] };
  }
}



export async function searchMovies(query: string, year?: string) {
  try {
    const movieParams: Record<string, string> = {
      query: query.trim(),
      include_adult: 'false',
      language: 'en-US',
    };
    if (year) movieParams.primary_release_year = year.trim();

    const tvParams: Record<string, string> = {
      query: query.trim(),
      include_adult: 'false',
      language: 'en-US',
    };
    if (year) tvParams.first_air_date_year = year.trim();

    // Fetch movies and TV shows in parallel
    const [movieData, tvData] = await Promise.all([
      tmdbFetch("/search/movie", movieParams),
      tmdbFetch("/search/tv", tvParams)
    ]);

    const movieResults = (movieData.results || []).map((r: any) => ({ ...r, media_type: "movie" }));
    const tvResults = (tvData.results || []).map((r: any) => ({ ...r, media_type: "tv" }));
    
    const results = [...movieResults, ...tvResults];
    
    if (results.length === 0) return [];

    // Use our dedicated search engine for ranking and mapping
    return rankSearchResults(results, query);
  } catch (error) {
    console.error("[TMDB] searchMovies failed:", error);
    return [];
  }
}

export async function getTrendingWatch(page = 1) {
  try {
    const data = await tmdbFetch("/trending/all/day", { page: page.toString() }, { next: { revalidate: 86400 } });
    return data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => ({
        id: item.media_type === "movie" ? `tmdb-movie-${item.id}` : `tmdb-tv-${item.id}` ,
        title: item.title || item.name,
        posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
        year: (item.release_date || item.first_air_date)?.split("-")[0],
        type: item.media_type,
      }));
  } catch (error) {
    console.error("Fetch trending watch failed:", error);
    throw error;
  }
}

export async function getMovieById(id: string) {
  try {
    const data = await tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,keywords' });
    const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name;

    return {
      id: `tmdb-movie-${data.id}`,
      title: data.title,
      tagline: data.tagline,
      category: "watch",
      type: "movie",
      isDocumentary: data.genres?.some((g: any) => g.id === 99),
      format: "Feature Film",
      posterUrl: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      year: data.release_date?.split("-")[0],
      releaseYear: parseInt(data.release_date?.split("-")[0]),
      creator: director,
      genres: data.genres?.map((g: any) => g.name),
      runtime: data.runtime,
      description: data.overview,
      languageCode: data.original_language,
    };
  } catch (error) {
    console.error(`getMovieById failed for ${id}:`, error);
    throw error;
  }
}

export async function getTVById(id: string) {
  try {
    const data = await tmdbFetch(`/tv/${id}`, { append_to_response: 'credits' });
    const creator = data.created_by?.[0]?.name || data.credits?.crew?.find((c: any) => c.job === "Executive Producer")?.name;

    return {
      id: `tmdb-tv-${data.id}`,
      title: data.name,
      tagline: data.tagline,
      category: "watch",
      type: "tv",
      format: data.type === "Miniseries" ? "Miniseries" : "TV Series",
      posterUrl: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      year: data.first_air_date?.split("-")[0],
      releaseYear: parseInt(data.first_air_date?.split("-")[0]),
      creator: creator,
      genres: data.genres?.map((g: any) => g.name),
      runtime: data.episode_run_time?.[0],
      description: data.overview,
      languageCode: data.original_language,
    };
  } catch (error) {
    console.error(`getTVById failed for ${id}:`, error);
    throw error;
  }
}
