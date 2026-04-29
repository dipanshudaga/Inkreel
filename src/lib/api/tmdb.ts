const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function getHeaders() {
  return {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  };
}

export async function searchMovies(query: string) {
  try {
    // 1. Try a more targeted search if we have a year in the query
    // We remove the year from the query string to let TMDB's algorithm handle title matches better,
    // but we can pass it as a separate param if we wanted. However, keeping it in query usually works.
    
    const url = `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}`;
    console.log(`[TMDB] Searching: ${url}`);
    const res = await fetch(url, { 
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[TMDB] Error ${res.status}: ${text}`);
      throw new Error(`TMDB Search Error: ${res.status}`);
    }
    const data = await res.json();
    
    // 2. Advanced Ranking Algorithm
    // Goal: Prioritize globally recognized masterpieces and popular titles over obscure matches.
    const rankedResults = (data.results || [])
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => {
        const voteAverage = item.vote_average || 0;
        const voteCount = item.vote_count || 0;
        const popularity = item.popularity || 0;
        
        // Quality Score: Combination of high ratings and high confidence (vote count)
        // We use log10 of vote count to normalize the massive range of votes
        const confidenceFactor = Math.log10(voteCount + 1);
        const qualityScore = voteAverage * confidenceFactor;
        
        // Final Rank: Quality + Popularity
        // We boost the score significantly if it has a high quality score
        const finalScore = qualityScore * 10 + popularity;
        
        return { ...item, _inkreelScore: finalScore };
      })
      .sort((a: any, b: any) => b._inkreelScore - a._inkreelScore);

    console.log(`[TMDB] Found and Smart-Ranked ${rankedResults.length} results for "${query}"`);
    
    return rankedResults.map((item: any) => ({
      id: item.media_type === "movie" ? `tmdb-movie-${item.id}` : `tmdb-tv-${item.id}`,
      title: item.title || item.name,
      category: "watch",
      type: item.media_type,
      posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
      year: (item.release_date || item.first_air_date)?.split("-")[0],
      rating: item.vote_average,
      voteCount: item.vote_count,
      popularity: item.popularity
    }));
  } catch (error) {
    console.error("[TMDB] searchMovies failed:", error);
    return [];
  }
}

export async function getTrendingWatch(page = 1) {
  const url = `${TMDB_BASE_URL}/trending/all/day?page=${page}`;
  try {
    const res = await fetch(url, { headers: getHeaders() });
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
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`TMDB Movie Details Error: ${res.status}`);
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
  } catch (error) {
    console.error(`getMovieById failed for ${id}:`, error);
    throw error;
  }
}

export async function getTVById(id: string) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${id}?append_to_response=credits`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`TMDB TV Details Error: ${res.status}`);
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
  } catch (error) {
    console.error(`getTVById failed for ${id}:`, error);
    throw error;
  }
}
