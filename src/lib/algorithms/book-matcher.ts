import { searchBooks } from "@/lib/api/google-books";

export async function matchReadItem(title: string, author?: string, isbn?: string, year?: string) {
  // Run ISBN and Title+Author searches in parallel for maximum performance
  const [isbnPromise, searchPromise] = await Promise.all([
    isbn ? searchBooks(isbn) : Promise.resolve([]),
    author ? searchBooks(title, author) : Promise.resolve([])
  ]);

  let isbnResult = isbnPromise.length > 0 ? isbnPromise[0] : null;
  let searchResult = null;

  if (searchPromise.length > 0) {
    // 1. Filter by title similarity
    const matches = searchPromise.filter(b => 
      b.title.toLowerCase().includes(title.toLowerCase()) || 
      title.toLowerCase().includes(b.title.toLowerCase())
    );
    
    // 2. Pick the most popular among matches (highest ratingsCount)
    if (matches.length > 0) {
      searchResult = matches.sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0))[0];
    } else {
      searchResult = searchPromise[0];
    }
  }

  // 3. Choice Logic: Prioritize the 'Popular' search result (Title + Author)
  // This ensures the initial sync matches the high-quality covers seen in 'Rematch'.
  if (searchResult) {
    return searchResult;
  }

  return isbnResult || null;
}
