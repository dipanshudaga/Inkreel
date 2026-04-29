const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(query: string) {
  try {
    const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20`);
    if (!res.ok) throw new Error(`Google Books Error: ${res.status}`);
    const data = await res.json();
    
    // Google Books Ranking: Prioritize items with images and higher ratings
    const sortedItems = (data.items || [])
      .sort((a: any, b: any) => {
        const hasImageA = a.volumeInfo.imageLinks ? 1 : 0;
        const hasImageB = b.volumeInfo.imageLinks ? 1 : 0;
        
        if (hasImageB !== hasImageA) return hasImageB - hasImageA;
        
        const countA = a.volumeInfo.ratingsCount || 0;
        const countB = b.volumeInfo.ratingsCount || 0;
        return countB - countA;
      });

    return sortedItems.map((item: any) => ({
      id: `gb-${item.id}`,
      title: item.volumeInfo.title,
      category: "read",
      type: "book",
      posterUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
      year: item.volumeInfo.publishedDate?.split("-")[0],
      creator: item.volumeInfo.authors?.join(", "),
    }));
  } catch (error) {
    console.error("[Google Books] searchBooks failed:", error);
    return [];
  }
}

export async function getTrendingBooks(startIndex = 0) {
  // Use a generic query for popular books since Google Books doesn't have a "trending" endpoint
  const url = `${GOOGLE_BOOKS_BASE_URL}?q=subject:fiction&orderBy=relevance&startIndex=${startIndex}&maxResults=10`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Books API Error: ${res.status}`);
    }
    const data = await res.json();
    
    return data.items?.map((item: any) => ({
      id: `gb-${item.id}`,
      title: item.volumeInfo.title,
      category: "read",
      type: "book",
      posterUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
      year: item.volumeInfo.publishedDate?.split("-")[0],
    })) || [];
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
    genres: info.categories,
    description: info.description,
    pageCount: info.pageCount,
    languageCode: info.language,
  };
}

export const MOCK_BOOKS: any[] = [];
