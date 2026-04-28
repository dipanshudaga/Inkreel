const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
};

export async function searchMovies(query: string) {
  const res = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}`, { headers });
  const data = await res.json();
  
  return data.results
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
    .map((item: any) => ({
      id: item.media_type === "movie" ? `tmdb-movie-${item.id}` : `tmdb-tv-${item.id}`,
      title: item.title || item.name,
      category: "watch",
      type: item.media_type,
      posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
      year: (item.release_date || item.first_air_date)?.split("-")[0],
    }));
}

export async function getTrendingWatch(page = 1) {
  const url = `${TMDB_BASE_URL}/trending/all/day?page=${page}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`TMDB API Error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`TMDB API Error: ${res.status}`);
    }
    const data = await res.json();
    return data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => ({
        id: item.media_type === "movie" ? `tmdb-movie-${item.id}` : `tmdb-tv-${item.id}`,
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
  const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits`, { headers });
  const data = await res.json();

  const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name;

  return {
    id: `tmdb-movie-${data.id}`,
    title: data.title,
    tagline: data.tagline,
    category: "watch",
    type: "movie",
    format: "Feature Film",
    posterUrl: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
    backdropUrl: data.backdrop_path ? `${IMAGE_BASE_URL}${data.backdrop_path}` : null,
    year: data.release_date?.split("-")[0],
    releaseYear: parseInt(data.release_date?.split("-")[0]),
    creator: director,
    genres: data.genres?.map((g: any) => g.name),
    runtime: data.runtime,
    description: data.overview,
    languageCode: data.original_language,
  };
}

export async function getTVById(id: string) {
  const res = await fetch(`${TMDB_BASE_URL}/tv/${id}?append_to_response=credits`, { headers });
  const data = await res.json();

  const creator = data.created_by?.[0]?.name || data.credits?.crew?.find((c: any) => c.job === "Executive Producer")?.name;

  return {
    id: `tmdb-tv-${data.id}`,
    title: data.name,
    tagline: data.tagline,
    category: "watch",
    type: "tv",
    format: data.type === "Miniseries" ? "Miniseries" : "TV Series",
    posterUrl: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
    backdropUrl: data.backdrop_path ? `${IMAGE_BASE_URL}${data.backdrop_path}` : null,
    year: data.first_air_date?.split("-")[0],
    releaseYear: parseInt(data.first_air_date?.split("-")[0]),
    creator: creator,
    genres: data.genres?.map((g: any) => g.name),
    runtime: data.episode_run_time?.[0],
    description: data.overview,
    languageCode: data.original_language,
  };
}
