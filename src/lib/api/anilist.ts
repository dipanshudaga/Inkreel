const ANILIST_API_URL = "https://graphql.anilist.co";

async function safeAniListFetch(query: string, variables: any) {
  try {
    const res = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();
    if (json.errors) {
      console.warn("AniList API Errors:", json.errors);
      return null;
    }
    return json.data;
  } catch (error: any) {
    console.warn("AniList Fetch Error:", error?.message || error);
    return null;
  }
}

export async function searchAniList(query: string, type: "ANIME" | "MANGA") {
  const searchQuery = `
    query ($search: String, $type: MediaType) {
      Page(perPage: 20) {
        media(search: $search, type: $type) {
          id
          title {
            english
            romaji
            native
          }
          type
          format
          status
          description
          startDate {
            year
          }
          genres
          averageScore
          coverImage {
            large
          }
          bannerImage
          duration
          chapters
          volumes
          studios(isMain: true) {
            nodes {
              name
            }
          }
          staff(perPage: 1) {
            edges {
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await safeAniListFetch(searchQuery, { search: query, type });
  if (!data?.Page?.media) return [];

  return data.Page.media.map((m: any) => ({
    id: `anilist-${m.id}`,
    category: type === "ANIME" ? "watch" : "read",
    type: type === "ANIME" ? "anime" : "manga",
    format: m.format, // TV, MOVIE, OVA, etc.
    title: m.title.english || m.title.romaji || m.title.native,
    slug: (m.title.english || m.title.romaji || m.title.native)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    posterUrl: m.coverImage.large,
    backdropUrl: m.bannerImage,
    year: m.startDate.year,
    creator: m.staff?.edges?.[0]?.node?.name?.full || m.studios?.nodes?.[0]?.name || "Unknown", 
    description: m.description?.replace(/<[^>]*>?/gm, ""), 
    genres: m.genres,
    runtime: m.type === "ANIME" ? m.duration : m.chapters || m.volumes,
  }));
}

export async function getAniListById(id: number) {
  const detailQuery = `
    query ($id: Int) {
      Media(id: $id) {
        id
        title {
          english
          romaji
          native
        }
        type
        format
        status
        description
        startDate {
          year
        }
        genres
        averageScore
        coverImage {
          large
        }
        bannerImage
        episodes
        chapters
        volumes
        duration
        studios(isMain: true) {
          nodes {
            name
          }
        }
        staff(perPage: 10) {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  `;

  const data = await safeAniListFetch(detailQuery, { id });
  const m = data?.Media;
  if (!m) return null;

  const type = m.type === "ANIME" ? "anime" : "manga";
  
  const creator = m.staff?.edges?.find((e: any) => 
    e.role.toLowerCase().includes("director") || 
    e.role.toLowerCase().includes("author") || 
    e.role.toLowerCase().includes("original story")
  )?.node?.name?.full 
    || m.studios?.nodes?.[0]?.name 
    || "Unknown Creator";

  return {
    id: `anilist-${m.id}`,
    category: m.type === "ANIME" ? "watch" : "read",
    type,
    title: m.title.english || m.title.romaji || m.title.native,
    slug: (m.title.english || m.title.romaji || m.title.native)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    posterUrl: m.coverImage.large,
    backdropUrl: m.bannerImage,
    year: m.startDate.year,
    releaseYear: m.startDate.year,
    creator,
    description: m.description?.replace(/<[^>]*>?/gm, ""),
    genres: m.genres,
    runtime: m.type === "ANIME" ? m.duration : m.chapters || m.volumes,
    episodes: m.episodes,
    chapters: m.chapters,
    volumes: m.volumes,
  };
}
