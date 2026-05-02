const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
 
function cleanGenres(categories: string[] | undefined) {
  if (!categories) return [];
  return categories.map(cat => {
    // Google Books often returns "Fiction / Classics" or "Computers / Programming"
    // We want the most specific part (the last part)
    const parts = cat.split(" / ");
    return parts[parts.length - 1];
  });
}

export async function searchBooks(query: string, author?: string, year?: string) {
  try {
    let finalQuery = query;
    if (query.startsWith("gb-import-") || query.match(/^\d{10}|\d{13}$/)) {
      const isbn = query.replace("gb-import-", "");
      finalQuery = `isbn:${isbn}`;
    } else {
      if (author) finalQuery += ` inauthor:${author}`;
      // Note: Google Books doesn't have a reliable 'year' filter in the query string, 
      // but we can add it to the general search or filter results later.
    }

    const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(finalQuery)}&maxResults=20`);
    if (!res.ok) throw new Error(`Google Books Error: ${res.status}`);
    const data = await res.json();
    
    // Google Books Ranking: Prioritize Exact Matches -> Author Match -> Popularity
    const sortedItems = (data.items || [])
      .sort((a: any, b: any) => {
        // Pass 1: Image presence is non-negotiable for a good library view
        const hasImageA = a.volumeInfo.imageLinks ? 1 : 0;
        const hasImageB = b.volumeInfo.imageLinks ? 1 : 0;
        if (hasImageB !== hasImageA) return hasImageB - hasImageA;
        
        const titleA = a.volumeInfo.title.toLowerCase();
        const titleB = b.volumeInfo.title.toLowerCase();
        const normalizedTarget = query.toLowerCase().trim();

        // Pass 2: Exact Title Match (Highest Priority)
        const isExactA = titleA === normalizedTarget ? 1 : 0;
        const isExactB = titleB === normalizedTarget ? 1 : 0;
        if (isExactB !== isExactA) return isExactB - isExactA;

        // Pass 3: Author Match
        if (author) {
          const authorLower = author.toLowerCase();
          const hasAuthorA = (a.volumeInfo.authors || []).some((au: string) => au.toLowerCase().includes(authorLower)) ? 1 : 0;
          const hasAuthorB = (b.volumeInfo.authors || []).some((au: string) => au.toLowerCase().includes(authorLower)) ? 1 : 0;
          if (hasAuthorB !== hasAuthorA) return hasAuthorB - hasAuthorA;
        }

        // Pass 4: Popularity (Ratings Count)
        const countA = a.volumeInfo.ratingsCount || 0;
        const countB = b.volumeInfo.ratingsCount || 0;
        return countB - countA;
      });

    return sortedItems.map((item: any) => {
      const links = item.volumeInfo.imageLinks;
      let posterUrl = links?.medium || links?.small || links?.thumbnail || links?.smallThumbnail;
      
      // Force HTTPS to prevent mixed content issues
      if (posterUrl) {
        posterUrl = posterUrl.replace("http://", "https://");
      }

      return {
        id: `gb-${item.id}`,
        title: item.volumeInfo.title,
        category: "read",
        type: "book",
        posterUrl: posterUrl,
        year: item.volumeInfo.publishedDate?.split("-")[0],
        creator: item.volumeInfo.authors?.join(", "),
        genres: cleanGenres(item.volumeInfo.categories),
        ratingsCount: item.volumeInfo.ratingsCount || 0,
      };
    });
  } catch (error) {
    console.error("[Google Books] searchBooks failed:", error);
    return [];
  }
}

export async function getTrendingBooks(startIndex = 0) {
  // Use a generic query for popular books since Google Books doesn't have a "trending" endpoint
  const url = `${GOOGLE_BOOKS_BASE_URL}?q=subject:fiction&orderBy=relevance&startIndex=${startIndex}&maxResults=10`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      throw new Error(`Google Books API Error: ${res.status}`);
    }
    const data = await res.json();
    
    return data.items?.map((item: any) => {
      const links = item.volumeInfo.imageLinks;
      let posterUrl = links?.medium || links?.small || links?.thumbnail || links?.smallThumbnail;
      
      if (posterUrl) {
        posterUrl = posterUrl.replace("http://", "https://");
      }

      return {
        id: `gb-${item.id}`,
        title: item.volumeInfo.title,
        category: "read",
        type: "book",
        posterUrl: posterUrl,
        year: item.volumeInfo.publishedDate?.split("-")[0],
      };
    }) || [];
  } catch (error) {
    console.error("Fetch trending books failed:", error);
    throw error;
  }
}

export async function getBookById(id: string) {
  const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}/${id}`);
  const data = await res.json();
  const info = data.volumeInfo;

  return {
    id: `gb-${data.id}`,
    title: info.title,
    subtitle: info.subtitle,
    category: "read",
    type: "book",
    format: info.printType === "BOOK" ? "Book" : "Magazine",
    posterUrl: info.imageLinks?.medium || info.imageLinks?.thumbnail,
    year: info.publishedDate?.split("-")[0],
    releaseYear: parseInt(info.publishedDate?.split("-")[0]),
    creator: info.authors?.join(", "),
    genres: cleanGenres(info.categories),
    description: info.description,
    pageCount: info.pageCount,
    languageCode: info.language,
  };
}

export const MOCK_BOOKS: any[] = [];
