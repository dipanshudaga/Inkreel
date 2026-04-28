# Inkreel API Capabilities & Data Mapping

This document outlines the rich metadata available from our external providers and how we synthesize it into the Inkreel experience.

## 1. TMDB (Movies & TV Shows)
**Available Metadata:**
- **Core:** Title, Original Title, Tagline, Overview.
- **Imagery:** High-res Posters, Backdrops, Logo paths.
- **Stats:** Release Date, Runtime (minutes), Status (Released, In Production).
- **Credits:** Full Cast, Crew (Directors, Cinematographers, Writers).
- **Keywords:** Genres, Production Companies, Spoken Languages.
- **Ratings:** Global Vote Average and Vote Count.
- **Inkreel Use Case:** We fetch everything to create the immersive detail page. Future features can use "Taglines" for beautiful header typography.

## 2. AniList (Anime & Manga)
**Available Metadata:**
- **Core:** Romaji, English, and Native titles. Description (HTML).
- **Format:** TV, Movie, OVA, Special, Manga, One-shot, Novel.
- **Stats:** Episode count, Chapter count, Volume count.
- **Aesthetic:** Cover Image (Extra Large), Banner Image, Accent Color.
- **Scoring:** Mean Score, Popularity.
- **Studios:** Animation studios (e.g., MAPPA, Ufotable).
- **Inkreel Use Case:** We leverage the "Accent Color" to dynamically theme the item pages, making each anime/manga feel unique.

## 3. Google Books / OpenLibrary
**Available Metadata:**
- **Core:** Title, Subtitle, Authors.
- **Detail:** Description, Page Count, Categories.
- **Publishing:** Publisher, Published Date, ISBN-13.
- **Imagery:** Small, Medium, and Large thumbnail covers.
- **Inkreel Use Case:** We prioritize Author names as the "Creator" field to align books with directors in the "Watch" section.

---

# Data Persistence Model

What we store in our PostgreSQL (Drizzle) database for every user entry:

### The `media` Table
- **Identifiers:** `id` (Local UUID), `externalId` (e.g., `tmdb-123`).
- **Metadata Snapshot:** `title`, `posterUrl`, `backdropUrl`, `releaseYear`, `creator`, `genres`, `description`.
- **User State:**
  - `status`: One of `completed` (Watched/Read), `plan_to_watch` (Watchlist), `plan_to_read` (Shelf).
  - `rating`: 0 to 5 (half-star increments supported).
  - `completedAt`: ISO string of when the item was finished.
  - `updatedAt`: Last change timestamp for cache-busting.

### The `logs` Table
- **History:** Every time you watch, rate, or add to watchlist, a row is created.
- **Action:** `added`, `updated`, `finished`, `favorited`.
- **Context:** `date` and optional `notes` for a true personal diary feel.
