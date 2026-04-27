const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(TMDB_ACCESS_TOKEN ? { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } : {}),
});

async function safeTMDBFetch(url: string) {
  try {
    // Determine the URL with fallback for API Key
    let finalUrl = url;
    const hasQuery = url.includes("?");
    
    // If no Bearer token, we MUST use api_key in URL
    if (!TMDB_ACCESS_TOKEN && TMDB_API_KEY) {
      finalUrl += `${hasQuery ? "&" : "?"}api_key=${TMDB_API_KEY}`;
    }

    const res = await fetch(finalUrl, { 
      headers: getHeaders(),
      next: { revalidate: 3600 } 
    });
    
    // If Bearer token failed (401) and we have an API Key, try falling back to API Key in URL
    if (res.status === 401 && TMDB_ACCESS_TOKEN && TMDB_API_KEY) {
      console.warn(`TMDB Bearer Token failed (401). Falling back to API Key...`);
      const fallbackUrl = url + `${hasQuery ? "&" : "?"}api_key=${TMDB_API_KEY}`;
      const retryRes = await fetch(fallbackUrl, { next: { revalidate: 3600 } });
      if (retryRes.ok) return await retryRes.json();
    }
    
    if (!res.ok) {
      console.error(`TMDB API Error: ${res.status} ${res.statusText} for URL: ${finalUrl}`);
      return null;
    }
    
    return await res.json();
  } catch (error: any) {
    console.error(`TMDB Fetch Exception for ${url}:`, error?.message || error);
    return null;
  }
}
export const MOCK_MOVIES = [
  {
    id: "tmdb-movie-dune-2",
    category: "watch" as const,
    type: "movie",
    title: "Dune: Part Two",
    slug: "movie-693134-dune-part-two",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdf6itp6p4qTZbVbbNVp4pCzg0.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8Y98X6zXWf7asS8RNoFkAn46X12.jpg",
    year: 2024,
    creator: "Denis Villeneuve",
    description: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
    genres: ["Sci-Fi", "Adventure"],
    rating: 4.5,
    runtime: 166
  },
  {
    id: "tmdb-movie-inception",
    category: "watch" as const,
    type: "movie",
    title: "Inception",
    slug: "movie-27205-inception",
    posterUrl: "https://image.tmdb.org/t/p/w500/o099vY7tZp79S30D9ST9p97Xp7l.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8Z099KvepOn9qTZbVbbNVp4pCzg0.jpg",
    year: 2010,
    creator: "Christopher Nolan",
    description: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
    genres: ["Sci-Fi", "Action", "Drama"],
    rating: 4.8,
    runtime: 148
  },
  {
    id: "tmdb-movie-dark-knight",
    category: "watch" as const,
    type: "movie",
    title: "The Dark Knight",
    slug: "movie-155-the-dark-knight",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDO92SMRvVc7O9R96S1.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8Z099KvepOn9qTZbVbbNVp4pCzg0.jpg",
    year: 2008,
    creator: "Christopher Nolan",
    description: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    genres: ["Action", "Crime", "Drama"],
    rating: 5.0,
    runtime: 152
  }
];

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

// Minimal genre mapping for common IDs
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function mapGenres(ids: number[]) {
  return (ids || []).map(id => GENRE_MAP[id]).filter(Boolean);
}

export async function searchTMDB(query: string) {
  try {
    if (!TMDB_API_KEY) {
      return MOCK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
    }

    const [movieData, tvData] = await Promise.all([
      safeTMDBFetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`),
      safeTMDBFetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}`)
    ]);
    
    if (!movieData && !tvData) return [];

    const movies = (movieData.results || []).map((m: any) => {
      const genres = mapGenres(m.genre_ids);
      const isAnimated = genres.includes("Animation");
      const type = (isAnimated && m.original_language === "ja") ? "anime" : "movie";
      return {
        id: `tmdb-movie-${m.id}`,
        category: "watch" as const,
        type,
        title: m.title,
        slug: m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        year: m.release_date ? new Date(m.release_date).getFullYear() : null,
        creator: "Unknown",
        description: m.overview,
        genres,
        rating: m.vote_average / 2,
      };
    });

    const tvs = (tvData.results || []).map((m: any) => {
      const genres = mapGenres(m.genre_ids);
      const isAnimated = genres.includes("Animation");
      const type = (isAnimated && m.original_language === "ja") ? "anime" : "tv";
      return {
        id: `tmdb-tv-${m.id}`,
        category: "watch" as const,
        type,
        title: m.name,
        slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        year: m.first_air_date ? new Date(m.first_air_date).getFullYear() : null,
        creator: "TV Series",
        description: m.overview,
        genres,
        rating: m.vote_average / 2,
      };
    });

    return [...movies, ...tvs].sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error("TMDB Multi Search Error:", error);
    return [];
  }
}

export async function getTrendingWatch(page: number = 1) {
  try {
    if (!TMDB_API_KEY) return MOCK_MOVIES;

    const [movieData, tvData] = await Promise.all([
      safeTMDBFetch(`${TMDB_BASE_URL}/trending/movie/week?page=${page}`),
      safeTMDBFetch(`${TMDB_BASE_URL}/trending/tv/week?page=${page}`)
    ]);
    
    if (!movieData && !tvData) return MOCK_MOVIES;

    const movies = (movieData.results || []).map((m: any) => {
      const genres = mapGenres(m.genre_ids);
      const isAnimated = genres.includes("Animation");
      const type = (isAnimated && m.original_language === "ja") ? "anime" : "movie";
      return {
        id: `tmdb-movie-${m.id}`,
        category: "watch" as const,
        type,
        title: m.title,
        slug: m.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        year: m.release_date ? new Date(m.release_date).getFullYear() : null,
        genres,
        rating: m.vote_average / 2,
      };
    });

    const tvs = (tvData.results || []).map((m: any) => {
      const genres = mapGenres(m.genre_ids);
      const isAnimated = genres.includes("Animation");
      const type = (isAnimated && m.original_language === "ja") ? "anime" : "tv";
      return {
        id: `tmdb-tv-${m.id}`,
        category: "watch" as const,
        type,
        title: m.name,
        slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        year: m.first_air_date ? new Date(m.first_air_date).getFullYear() : null,
        genres,
        rating: m.vote_average / 2,
      };
    });

    return [...movies, ...tvs].sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error("TMDB Trending Error:", error);
    return MOCK_MOVIES;
  }
}

export async function getMovieById(id: string) {
  try {
    const movie = await safeTMDBFetch(`${TMDB_BASE_URL}/movie/${id}`);
    if (!movie || !movie.id) return null;
    const genres = movie.genres?.map((g: any) => g.name) || [];
    const isAnimated = genres.includes("Animation");

    return {
      id: `tmdb-movie-${movie.id}`,
      category: "watch" as const,
      type: (isAnimated && movie.original_language === "ja") ? "anime" : "movie",
      title: movie.title,
      slug: movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      creator: movie.production_companies?.[0]?.name || "Unknown",
      description: movie.overview,
      genres,
      rating: movie.vote_average / 2,
      runtime: movie.runtime,
    };
  } catch (error) {
    return null;
  }
}

export async function getTVById(id: string) {
  try {
    const tv = await safeTMDBFetch(`${TMDB_BASE_URL}/tv/${id}`);
    if (!tv || !tv.id) return null;
    const genres = tv.genres?.map((g: any) => g.name) || [];
    const isAnimated = genres.includes("Animation");

    return {
      id: `tmdb-tv-${tv.id}`,
      category: "watch" as const,
      type: (isAnimated && tv.original_language === "ja") ? "anime" : "tv",
      title: tv.name,
      slug: tv.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      posterUrl: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : null,
      backdropUrl: tv.backdrop_path ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` : null,
      year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : null,
      creator: tv.created_by?.[0]?.name || "TV Series",
      description: tv.overview,
      genres,
      rating: tv.vote_average / 2,
      runtime: tv.episode_run_time?.[0],
    };
  } catch (error) {
    return null;
  }
}
