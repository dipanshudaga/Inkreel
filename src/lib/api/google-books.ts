const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";

export const MOCK_BOOKS = [
  {
    id: "gb-dune-1",
    category: "read",
    subType: "book",
    title: "Dune",
    slug: "dune",
    posterUrl: "https://books.google.com/books/content?id=B1hPr9uS9PMC&printsec=frontcover&img=1&zoom=1",
    year: 1965,
    creator: "Frank Herbert",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    genres: ["Science Fiction", "Epic"],
    rating: 5,
    pageCount: 688,
  },
  {
    id: "gb-project-hail-mary",
    category: "read",
    subType: "book",
    title: "Project Hail Mary",
    slug: "project-hail-mary",
    posterUrl: "https://books.google.com/books/content?id=9_kREAAAQBAJ&printsec=frontcover&img=1&zoom=1",
    year: 2021,
    creator: "Andy Weir",
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
    genres: ["Science Fiction", "Thriller"],
    rating: 4.8,
    pageCount: 476,
  },
  {
    id: "gb-dark-matter",
    category: "read",
    subType: "book",
    title: "Dark Matter",
    slug: "dark-matter",
    posterUrl: "https://books.google.com/books/content?id=XFp0CwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    year: 2016,
    creator: "Blake Crouch",
    description: "'Are you happy with your life?' Those are the last words Jason Dessen hears before the masked abductor knocks him unconscious.",
    genres: ["Science Fiction", "Mystery"],
    rating: 4.5,
    pageCount: 342,
  },
  {
    id: "gb-neuromancer",
    category: "read",
    subType: "book",
    title: "Neuromancer",
    slug: "neuromancer",
    posterUrl: "https://books.google.com/books/content?id=OQy9AAAAQBAJ&printsec=frontcover&img=1&zoom=1",
    year: 1984,
    creator: "William Gibson",
    description: "Case is the sharpest data-thief in the matrix, until he crossed the wrong people and they burned his nervous system with a toxin.",
    genres: ["Cyberpunk", "Sci-Fi"],
    rating: 4.7,
    pageCount: 271,
  }
];

export async function searchGoogleBooks(query: string, startIndex: number = 0) {
  try {
    const keyPart = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : "";
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}${keyPart}&startIndex=${startIndex}&maxResults=20`;
    
    console.log(`Fetching Google Books: ${url.replace(GOOGLE_BOOKS_API_KEY || "", "REDACTED")}`);
    let response;
    try {
      response = await fetch(url, { next: { revalidate: 3600 } });
      
      // If 503 or 429, try keyless fallback if we were using a key
      if (!response.ok && (response.status === 503 || response.status === 429 || response.status === 403) && GOOGLE_BOOKS_API_KEY) {
        console.warn(`Google Books API restricted [${response.status}]. Trying keyless fallback...`);
        const keylessUrl = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=20`;
        response = await fetch(keylessUrl, { next: { revalidate: 3600 } });
      }
    } catch (fetchError: any) {
      console.error(`Google Books fetch system error: ${fetchError.message}`);
      return [];
    }
    
    if (!response.ok) {
      console.warn(`Google Books API Error [${response.status}] for query "${query}".`);
      return [];
    }
    
    const data = await response.json();
    if (!data.items) {
      return [];
    }

    return data.items.map((book: any) => {
      const info = book.volumeInfo || {};
      const isManga = info.categories?.some((c: string) => c.toLowerCase().includes("manga") || c.toLowerCase().includes("comics"));
      const subType = isManga ? "manga" : "book";

      return {
        id: `gb-${book.id}`,
        category: "read",
        subType,
        title: info.title,
        slug: info.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        posterUrl: info.imageLinks?.thumbnail?.replace("http:", "https:"),
        year: info.publishedDate ? new Date(info.publishedDate).getFullYear() : null,
        creator: info.authors?.join(", ") || "Unknown",
        description: info.description || "",
        genres: info.categories || [],
        rating: info.averageRating || 0,
        pageCount: info.pageCount || 0,
      };
    });
  } catch (error) {
    console.error("Google Books Search Error:", error);
    return [];
  }
}

export async function getTrendingBooks(startIndex: number = 0) {
  // Google Books doesn't have a direct "trending" end point like TMDB.
  // Using subject:fiction as a proxy for discovery
  const results = await searchGoogleBooks("subject:fiction", startIndex);
  if (!results || results.length === 0) {
    return startIndex === 0 ? MOCK_BOOKS : [];
  }
  return results;
}
export async function getBookById(id: string) {
  try {
    const keyPart = GOOGLE_BOOKS_API_KEY ? `?key=${GOOGLE_BOOKS_API_KEY}` : "";
    const url = `${GOOGLE_BOOKS_BASE_URL}/volumes/${id}${keyPart}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const book = await response.json();
    const info = book.volumeInfo || {};

    return {
      id: `gb-${book.id}`,
      category: "read" as const,
      subType: "book",
      title: info.title,
      slug: info.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      posterUrl: info.imageLinks?.thumbnail?.replace("http:", "https:"),
      year: info.publishedDate ? new Date(info.publishedDate).getFullYear() : null,
      creator: info.authors?.join(", ") || "Unknown",
      description: info.description || "",
      genres: info.categories || [],
      rating: info.averageRating || 0,
      pageCount: info.pageCount || 0,
    };
  } catch (error) {
    console.error("Google Books Detail Error:", error);
    return null;
  }
}
