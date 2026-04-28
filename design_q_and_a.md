# Inkreel Design & API Q&A

I have processed all your feedback. Below are the answers to your specific questions. You can comment directly on this file or reply in chat.

### 1. Languages (Spirited Away Issue)
**Question:** Why does Spirited Away show "English" when it's a Japanese film?
**Answer:** Currently, we are likely fetching the `spoken_languages` array from TMDB and just taking the first one (or the list), which often includes the dubs. I will fix this to prioritize the **Original Language** of the film and show its full name (e.g., "Japanese") instead of just "English".

### 2. Taglines & Subtitles
**Feedback:** Implement taglines for movies and subtitles for books below the title.
**Plan:** I will update the database schema to store these fields and update the UI to display them in a beautiful, italic serif font right below the main title.

### 3. AniList Banners & Colors
**Question:** Are we showing banner images for AniList?
**Answer:** We are fetching them, but I will make sure they are prominently used as the background.
**Feedback (Line 23):** "No let's not do it" regarding dynamic accent colors.
**Plan:** I will **REMOVE** the logic that themes the page based on the anime's accent color. We will keep the site-wide "Traced" aesthetic consistent (Creme/Dark/Vermilion) regardless of the media type.

### 4. Media Formats (Line 18)
**Question:** Are we fetching everything here (TV, Movie, OVA...), and how are we differentiating it?
**Answer:** Yes, we fetch the `format` from AniList. I differentiate it by storing it in the `type` column. In the UI, I will now display this clearly as "Format: OVA" or "Format: TV Series" so you can see the subcategory immediately.

### 5. API Formats Reference
**Question:** What are all the formats we are getting from the APIs?

**AniList (Anime & Manga):**
- `TV`: Standard TV series.
- `TV_SHORT`: Short TV series (usually < 15 mins).
- `MOVIE`: Anime films.
- `SPECIAL`: TV Specials/Side stories.
- `OVA`: Original Video Animation (Direct to disc).
- `ONA`: Original Net Animation (Streaming exclusives).
- `MANGA`: Standard manga series.
- `NOVEL`: Light novels.
- `ONE_SHOT`: Single chapter manga.

**TMDB (Cinema & TV):**
- `Movie`: Standard feature films.
- `TV Series`: Standard episodic television.
- *Note:* We can further refine TV into "Miniseries" or "Documentary" using TMDB's `type` field if desired.

### 6. Layout: 3 Columns for Metadata
**Feedback:** Don't use a visible grid; keep the current format and just add a third column for Runtime/Page Count.
**Plan:** I will keep the minimalist, typographic style you have now. I'll simply align the "Runtime" or "Page Count" as a third block alongside "Language" and "Genres," keeping the same vertical labels and serif/sans-serif contrast.

### 7. Page Count
**Feedback:** Show page count below for books.
**Plan:** I will add the `pageCount` field to the book detail view, positioned similarly to runtime for movies.

### 8. The "Love" State & Database Simplification
**Feedback:** Why aren't we storing love state? Remove logs, history, and timestamps.
**Answer:** 
- **Love State:** I will add an explicit `isLoved` boolean to the database so we don't have to "calculate" it from the rating. It will be the source of truth.
- **Simplification:** I hear you—you want a "final state" archive, not a complex history tracker. I will:
    - [DELETE] `logs` table.
    - [DELETE] `completedAt` and `updatedAt` from the `media` table.
    - This will make the database extremely lightweight and focused only on the "Last and Final Truth."

### 9. Subcategory Visibility
**Feedback:** Show the subcategory (Movie, TV Series, etc.) on the opening page.
**Plan:** I will add a "Format" label (e.g., "Feature Film", "TV Series", "Manga") prominently near the year/creator line.

---

**Next Steps:**
Once you've reviewed these answers, I will begin the "Massive Cleanup" to simplify the database and implement these UI refinements.
