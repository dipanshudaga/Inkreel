const ANILIST_API_URL = "https://graphql.anilist.co";

export async function searchAniList(query: string) {
  const graphqlQuery = `
    query ($search: String) {
      Page(perPage: 10) {
        media(search: $search, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          type
          format
          coverImage {
            large
          }
          startDate {
            year
          }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { search: query },
    }),
  });

  const data = await res.json();
  
  return data.data.Page.media.map((item: any) => ({
    id: `anilist-${item.id}`,
    title: item.title.english || item.title.romaji,
    category: item.type === "ANIME" ? "watch" : "read",
    type: item.type === "ANIME" ? "anime" : "manga",
    format: item.format,
    posterUrl: item.coverImage.large,
    year: item.startDate.year,
  }));
}

export async function getAniListById(id: number) {
  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id) {
        id
        title {
          romaji
          english
          native
        }
        type
        format
        description
        startDate {
          year
        }
        genres
        coverImage {
          extraLarge
        }
        bannerImage
        averageScore
        episodes
        chapters
        volumes
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { id },
    }),
  });

  const data = await res.json();
  const item = data.data.Media;

  return {
    id: `anilist-${item.id}`,
    title: item.title.english || item.title.romaji,
    category: item.type === "ANIME" ? "watch" : "read",
    type: item.type === "ANIME" ? "anime" : "manga",
    format: item.format,
    posterUrl: item.coverImage.extraLarge,
    backdropUrl: item.bannerImage,
    year: item.startDate.year,
    releaseYear: item.startDate.year,
    creator: item.studios.nodes[0]?.name,
    genres: item.genres,
    description: item.description,
    runtime: item.episodes, // We use episodes as "runtime" for anime count
    pageCount: item.chapters || item.volumes,
    languageCode: "ja", // Anime is primarily Japanese
  };
}
