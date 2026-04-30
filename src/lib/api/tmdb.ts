const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getHeaders() {
  return {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  };
}

export async function searchMovies(query: string, year?: string) {
  try {
    const params = new URLSearchParams({
      query: query.trim(),
      include_adult: 'false',
      language: 'en-US',
    });
    const url = `${TMDB_BASE_URL}/search/multi?${params.toString()}`;
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
    let results = data.results || [];
    
    // 1.5 Aggressive Fallback: search/multi is broad but doesn't support years.
    // We run search/movie if results are low or a year is provided to ensure accuracy.
    if (results.length < 5 || year) {
      const movieParams = new URLSearchParams({
        query: query.trim(),
        include_adult: 'false',
        language: 'en-US',
      });
      if (year) movieParams.append('primary_release_year', year.trim());
      
      const movieUrl = `${TMDB_BASE_URL}/search/movie?${movieParams.toString()}`;
      const movieRes = await fetch(movieUrl, { headers: getHeaders(), cache: 'no-store' });
      if (movieRes.ok) {
        const movieData = await movieRes.json();
        const movieResults = (movieData.results || []).map((r: any) => ({ ...r, media_type: "movie" }));
        results = [...results, ...movieResults];
      }
    }

    // Deduplicate by ID
    const uniqueResults = Array.from(new Map(results.map((item: any) => [item.id, item])).values());

    const rankedResults = uniqueResults
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => {
        const title = (item.title || item.name || "").toLowerCase();
        const originalTitle = (item.original_title || item.original_name || "").toLowerCase();
        const voteAverage = item.vote_average || 0;
        const voteCount = item.vote_count || 0;
        const popularity = item.popularity || 0;
        
        // Exact match boost: Huge priority if titles are identical
        const queryClean = query.toLowerCase().trim();
        const queryNoYear = queryClean.replace(/\s\d{4}$/, "").trim();
        
        let matchBoost = 1;
        if (title === queryClean || title === queryNoYear || originalTitle === queryClean || originalTitle === queryNoYear) {
          matchBoost = 100; // Increased boost for exact matches
        } else if (title.includes(queryNoYear) || queryNoYear.includes(title) || originalTitle.includes(queryNoYear)) {
          matchBoost = 10;
        }

        // Year match boost: If user types a year, prioritize results from that year
        const resultYear = (item.release_date || item.first_air_date)?.split("-")[0];
        const queryYearMatch = query.match(/\d{4}/);
        const queryYear = queryYearMatch ? queryYearMatch[0] : null;
        if (queryYear && resultYear === queryYear) {
          matchBoost *= 20; // Massive boost for matching the explicit year in query
        }

        // Poster match boost: Prioritize results that actually have artwork
        const posterBoost = item.poster_path ? 1.5 : 1;

        // Final Rank: (Quality + Popularity) * Match Precision * Poster Availability
        const finalScore = (qualityScore * 10 + (popularity / 2)) * matchBoost * posterBoost;
        
        return { ...item, _inkreelScore: finalScore };
      })
      .sort((a: any, b: any) => b._inkreelScore - a._inkreelScore);

    console.log(`[TMDB] Found and Smart-Ranked ${rankedResults.length} results for "${query}"`);
    
    return rankedResults.map((item: any) => {
      const isAnime = item.genre_ids?.includes(16) && 
                      (item.origin_country?.includes('JP') || item.original_language === 'ja');
      
      const title = item.title || item.name || "";
      const isStandup = item.genre_ids?.includes(35) && (
        title.toLowerCase().includes("stand-up") || 
        title.toLowerCase().includes("comedy special") ||
        title.toLowerCase().includes("live in") ||
        title.toLowerCase().includes("alive from") ||
        (title.includes(":") && item.genre_ids?.includes(10770)) ||
        item.genre_ids?.includes(10770)
      );

      return {
        id: item.media_type === "movie" ? `tmdb-movie-${item.id}` : `tmdb-tv-${item.id}`,
        title: title,
        category: "watch",
        type: isStandup ? 'standup' : (isAnime ? 'anime' : item.media_type),
        isDocumentary: item.genre_ids?.includes(99),
        isStandup: isStandup,
        posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null,
        year: (item.release_date || item.first_air_date)?.split("-")[0],
        rating: item.vote_average,
        voteCount: item.vote_count,
        popularity: item.popularity
      };
    });
  } catch (error) {
    console.error("[TMDB] searchMovies failed:", error);
    return [];
  }
}

export async function getTrendingWatch(page = 1) {
  const url = `${TMDB_BASE_URL}/trending/all/day?page=${page}`;
  try {
    const res = await fetch(url, { 
      headers: getHeaders(),
      next: { revalidate: 86400 } // Cache for 24 hours
    });
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
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,keywords`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`TMDB Movie Details Error: ${res.status}`);
    const data = await res.json();

    const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name;
    const isStandup = data.genres?.some((g: any) => g.id === 35) && (
      data.keywords?.keywords?.some((k: any) => k.id === 9716 || k.id === 10183) ||
      data.title.toLowerCase().includes("stand-up") ||
      data.title.toLowerCase().includes("comedy special") ||
      data.genres?.some((g: any) => g.id === 10770)
    );

    return {
      id: `tmdb-movie-${data.id}`,
      title: data.title,
      tagline: data.tagline,
      category: "watch",
      type: isStandup ? "standup" : "movie",
      isStandup: isStandup,
      isDocumentary: data.genres?.some((g: any) => g.id === 99),
      format: isStandup ? "Standup Special" : "Feature Film",
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
