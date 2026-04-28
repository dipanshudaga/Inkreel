const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(query: string) {
  const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10`);
  const data = await res.json();
  
  return data.items?.map((item: any) => ({
    id: `gb-${item.id}`,
    title: item.volumeInfo.title,
    category: "read",
    type: "book",
    posterUrl: item.volumeInfo.imageLinks?.thumbnail,
    year: item.volumeInfo.publishedDate?.split("-")[0],
  })) || [];
}

export async function getTrendingBooks(startIndex = 0) {
  // Use a generic query for popular books since Google Books doesn't have a "trending" endpoint
  const url = `${GOOGLE_BOOKS_BASE_URL}?q=subject:fiction&orderBy=newest&startIndex=${startIndex}&maxResults=10`;
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
