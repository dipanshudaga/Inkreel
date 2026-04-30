# Inkreel Search & Matching Intelligence

This document outlines the architectural logic used to ensure high-fidelity media matching and ranking across the Inkreel ecosystem.

## 1. Search Ranking Engine (TMDB)
Located in `src/lib/api/tmdb.ts`, this algorithm processes raw results from the TMDB API and re-ranks them based on "Cultural Significance."

### The Scoring Formula
Every result is assigned an `_inkreelScore` using the following logic:

1. **Normalization**: The search algorithm performs dual-comparison. It checks the title against the full query *and* a version with any trailing year removed. This ensures that movies like *1917* are matched correctly, while search strings like "Inception 2010" still benefit from an exact-title boost for "Inception."
2. **Quality Score**: We calculate a base quality metric using the **Global Average Rating** (provided by TMDB/Google Books) and the total vote volume:
   `Quality = VoteAverage * log10(VoteCount + 1)`
   *Using the logarithm of vote counts ensures that a movie with 20,000 votes is prioritized over a movie with 2 votes, even if the latter has a slightly higher average.*
3. **Masterpiece Boost**: 
   - **Exact Match (50x)**: If the title matches the query exactly, the score is multiplied by 50.
   - **Partial Match (5x)**: If the query is contained within the title, the score is multiplied by 5.
4. **Final Rank**:
   `FinalScore = (Quality * 10 + (Popularity / 2)) * MatchBoost`

---

## 2. Import Auto-Matching Strategy
Located in `src/lib/actions/media.ts` (`batchSearchMediaAction`), this system ensures that titles imported from Letterboxd or Goodreads find their correct counterpart with minimal manual intervention.

### The Triple-Pass Fallback
The system attempts up to three sequential searches to find a match:

1. **Pass 1 (High Precision)**: Searches using `Title + Year`. This is the most accurate for common titles (e.g., "Pinocchio 2022" vs "Pinocchio 1940").
2. **Pass 2 (Broad Recovery)**: If Pass 1 returns 0 results, it strips the year and searches by `Title` only. This catches discrepancies where the provider's year might differ from TMDB by one year.
3. **Pass 3 (Fuzzy Recovery)**: If Pass 2 fails, it strips all punctuation and symbols, searching with `Alpha-numeric characters` only. This resolves issues with different colon or hyphen usage.

---

## 3. Rematch & Manual Search Logic
Located in `src/app/import/import-client.tsx`, this handles user-initiated corrections.

1. **Instant Context**: When the Rematch modal opens, it immediately triggers the Ranking Engine using the current item's title.
2. **Category Awareness**: The search automatically switches between **TMDB** (for movies/TV) and **Google Books** (for books) based on the item being corrected.
3. **Visual Confirmation**: Uses the `variant="rematch"` component, which swaps the standard "Search" icon for a "Check" icon, signaling a definitive selection.

---

## 4. Literary Search (Google Books)
Located in `src/lib/api/google-books.ts`.

- **Filtering**: Automatically filters for `printType: 'books'` to exclude periodicals or standalone chapters.
- **Ranking**: Prioritizes results where the query appears in the `title` over the `description` or `author` fields.
- **Deduplication**: Aggregates different editions of the same book to present the most "canonical" cover art.
