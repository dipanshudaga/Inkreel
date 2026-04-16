# Content Vault — The Unified Track-Everything Platform

### Complete Build Blueprint · Watch (Movies, TV, Anime) · Read (Books) · Play (Board Games)

---

## 0. What This Is

A self-hostable, community-driven media tracking and discovery platform that breaks the boundaries of traditional trackers. Inspired by **Letterboxd's elegant UI**, but built to handle a triad of entertainment: **Watch** (Movies, TV, Web Series, Anime), **Read** (Books, Manga, Comics), and **Play** (Board Games).

### Key Features
- **Watch Section**: Full episode-level and season-level tracking for series. Handles anime natively.
- **Read Section**: Goodreads-killer functionality. Tracks books, editions, reading progress (pages/chapters), and handles personal book shelves.
- **Play Section**: BoardGameGeek (BGG) styled tracking. Tracks physical board game collections, plays, player counts, and ratings.
- **Unified Diary & Social**: A single chronological diary, activity feed, list builder, and review system that seamlessly mixes films, books, and board games.
- **Design Excellence**: Adheres strictly to the Letterboxd UI design system for a clean, typography-led dark mode experience.

---

## 1. UI & Brand Guidelines (Letterboxd Style)

The entire application will use a clean, functional, and consistent design language based on Letterboxd's storefront styling. 

### Style Foundations
- **Visual style:** Clean, functional, implementation-oriented
- **Typography scale:** `font.size.xs=11px`, `font.size.sm=12px`, `font.size.md=13px`, `font.size.lg=15px`, `font.size.xl=16px`, `font.size.2xl=17.6px`, `font.size.3xl=18px`, `font.size.4xl=22px`
- **Color palette:** 
  - Text: `primary=#667788`, `secondary=#99aabb`, `tertiary=#ffffff`, `inverse=#aabbcc`
  - Surfaces: `base=#14181c`, `muted=#00ac1c` (accent green), `raised=#2c3440` (hover/cards)
- **Spacing scale:** `space.1=2px`, `space.2=3px`, `space.3=4px`, `space.4=5px`, `space.5=5.2px`, `space.6=6px`, `space.7=6.5px`, `space.8=7px` (Can be scaled up for web using standard tailwind `rem` values matching the ratio).
- **Radius/shadow/motion:** 
  - `radius.xs=2px`, `radius.sm=3px`, `radius.md=4px`
  - `shadow.1=rgba(221, 238, 255, 0.25) 0px 0px 0px 1px inset`
  - `motion.duration.fast=200ms`

### UX Rules
- **Interactivity**: Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- **Accessibility Target**: WCAG 2.2 AA. Keyboard-first interactions required.
- **Media Cards**: Use Letterboxd grid-style poster cards. Hovering reveals star ratings and quick-add actions.

---

## 2. External APIs & Data Sources

To support "everything", Content Vault pulls from multiple industry-standard APIs.

### 🎬 WATCH APIs
| API | Covers | Notes |
|---|---|---|
| **TMDB API v3** | Movies, TV series, Web Series | The standard. Free, 50 req/sec. Covers most western content. |
| **AniList GraphQL** | Anime series, OVAs, Anime Movies | Superior anime tracking data, episode counts, and studios. |

### 📚 READ APIs
| API | Covers | Notes |
|---|---|---|
| **Google Books API**| Books, Novels, Textbooks | Massive DB, covers millions of books. Covers ISBNs efficiently. |
| **Open Library API** | Books, Author data | Open-source alternative, great for missing metadata. |
| **AniList GraphQL** | Manga, Light Novels | Best for tracking Japanese reading material. |

### 🎲 PLAY APIs
| API | Covers | Notes |
|---|---|---|
| **BGG XML API v2** | Board Games, Expansions | The holy grail of board game data (BoardGameGeek). Contains player counts, playtime, weights (complexity), and mechanics. |
| **Board Game Atlas API** | Board Games | Good fallback with a more modern REST API than BGG. |

---

## 3. Tech Stack Decision

Built for velocity, type-safety, and Letterboxd-level UI fidelity.

```
Frontend      →  Next.js 15 (App Router) + TypeScript
UI Library    →  shadcn/ui + Tailwind CSS v4 (mapped to design tokens)
Animations    →  Framer Motion
Backend       →  Next.js API Routes + tRPC 
Auth          →  NextAuth.js v5
Database      →  PostgreSQL via Neon / Supabase + Drizzle ORM
Caching       →  Redis (Upstash) for API rate limiting and metadata
Search        →  Meilisearch (self-hostable fuzzy search)
Job Queue     →  BullMQ (for background BGG/TMDB metadata fetching)
```

---

## 4. Unified Database Schema (PostgreSQL)

By generalizing the `media` table, we can allow users to put a Movie, a Book, and a Board Game into the same "Favorites" list or display them sequentially in a single Diary.

```sql
-- ENUMS
CREATE TYPE media_category AS ENUM ('watch', 'read', 'play');
CREATE TYPE watch_type AS ENUM ('movie', 'tv', 'anime', 'web_series', 'ova');
CREATE TYPE read_type AS ENUM ('book', 'manga', 'graphic_novel', 'audiobook');
CREATE TYPE play_type AS ENUM ('board_game', 'rpg_system', 'expansion');
CREATE TYPE tracking_status AS ENUM ('planned', 'in_progress', 'completed', 'paused', 'dropped');

-- 1. UNIFIED MEDIA ITEMS
CREATE TABLE media (
  id uuid PRIMARY KEY,
  category media_category NOT NULL,
  sub_type text,             -- Maps to watch_type, read_type, or play_type
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  
  -- External IDs 
  tmdb_id integer NULL,
  anilist_id integer NULL,
  google_books_id text NULL,
  isbn13 text NULL,
  bgg_id integer NULL,
  
  -- Shared Metadata
  poster_url text,           -- Book cover, movie poster, or box art
  backdrop_url text,         -- Movie backdrop or game board layout
  year integer,
  creator text,              -- Director (Watch), Author (Read), Designer (Play)
  description text,
  genres text[],
  
  -- Category-Specific Metadata (Can be JSONB or nullable columns)
  duration integer,          -- Movie runtime in mins, or Board Game expected playtime
  page_count integer,        -- For Books
  min_players integer,       -- For Board Games
  max_players integer,       -- For Board Games
  
  created_at timestamp,
  updated_at timestamp
);

-- 2. EPISODES (Watch Only)
CREATE TABLE episodes (
  id uuid PRIMARY KEY,
  media_id uuid REFERENCES media(id),
  season_number integer,
  episode_number integer,
  title text,
  air_date date
);

-- 3. UNIFIED TRACKING (The core relationship)
CREATE TABLE tracking_entries (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  media_id uuid REFERENCES media(id),
  
  status tracking_status,    -- E.g., 'completed' = Watched, Read, or Played
  rating decimal(3,1),       -- 0.5 to 5.0 stars
  is_liked boolean,          -- Letterboxd heart
  
  -- Progress Tracking
  progress integer,          -- Current episode, current page #, or total plays
  total_expected integer,    -- Max episodes, max pages. Used for progress bars.
  
  -- Physical/Digital Ownership (especially useful for Books and Board Games)
  owned boolean DEFAULT false,
  
  started_at date,
  finished_at date,
  updated_at timestamp
);

-- 4. UNIFIED DIARY LOGS
-- A user logs that they watched a movie, read 50 pages, or played a game tonight.
CREATE TABLE diary_entries (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  media_id uuid REFERENCES media(id),
  episode_id uuid REFERENCES episodes(id) NULL,
  
  logged_date date NOT NULL,
  action_type text,          -- 'watched_full', 'watched_ep', 'read_pages', 'played_session'
  amount_progressed int,     -- e.g., pages read in this session, or points scored in a board game
  
  rating decimal(3,1),       -- Rating given at the time of log
  review_text text,          -- Mini review log
  rewatch_reread boolean DEFAULT false
);

-- 5. LISTS (Mix and Match!)
-- Allow lists like "My Sci-Fi Obsession" containing Dune (Book), Dune (Movie), and Dune: Imperium (Board game)
CREATE TABLE lists (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  title text,
  description text,
  is_public boolean DEFAULT true
);

CREATE TABLE list_items (
  id uuid PRIMARY KEY,
  list_id uuid REFERENCES lists(id),
  media_id uuid REFERENCES media(id),
  position integer
);
```

---

## 5. UI Application Architecture

### Navigation Elements
- **Global Nav:** Dark, minimal top bar. Links: `Watch`, `Read`, `Play`, `Lists`, `Activity`, `Profile`.
- **Search Menu:** Centered, expansive search overlay that segments results instantly into Watch/Read/Play columns.

### Core Views
1. **`/film/[slug]` , `/book/[slug]` , `/game/[slug]`** (The Media Details View)
   - **Hero Section**: Huge blurred backdrop. Clean poster floating on the left.
   - **Quick Actions Right Sidebar**: Letterboxd-style rating stars, "Watch/Read/Play" status dropdown, Like button, Log button.
   - **Details**: 
     - *Watch*: Cast, Crew, Seasons, Trailer.
     - *Read*: Author, Page count, Publisher, ISBN, Editions.
     - *Play*: Player Count (e.g., 2-4), Playtime (60-120 mins), Weight/Complexity (e.g., 3.5/5), Mechanics.
   - **Social Proof**: "Friends who have..." followed by top community reviews.

2. **`/members/[username]/diary`**
   - A unified feed. 
   - Row format: `[Date] | [Mini Poster] | [Title] (Badge: 📚Book/🎬Movie/🎲Game) | [Stars] | [Heart]`
   - Users can filter the diary by Category (Watch/Read/Play).

3. **`Log Entry Modal`**
   - The most critical UI component. Opens via global shortcut or button.
   - Smart adaptation:
     - If Movie: "I watched this on [Date]" -> "Review" -> "Rating"
     - If Book: Add tabs for "Log Progress (pages)" or "Log Finished Book".
     - If Board Game: Add inputs for "Who won?", "Player Count", "Play Time".

---

## 6. Implementation Plan & Phases

### Phase 1: Foundation & "Watch" Vertical MVP (Weeks 1-3)
- Build the Next.js shell with styled tailwind based on `DESIGN.md`.
- Implement NextAuth, Drizzle Schema, and Supabase connect.
- Integrate TMDB + AniList APIs. Save movies/series.
- Build Letterboxd-style Poster Card, Media Details, and Diary logging for films.

### Phase 2: The "Read" Vertical (Weeks 4-5)
- Integrate Google Books / OpenLibrary APIs.
- Build Book-specific UI logic (Progress tracking by pages/percentage).
- Modify Log Modal to handle `reading_progress` updates.
- Create `/book/[slug]` pages.

### Phase 3: The "Play" Vertical (Weeks 6-7)
- Integrate BoardGameGeek (BGG) XML API using a node XML parser.
- Build Board Game UI logic (Player counts, game weight).
- Implement Ownership toggle (critical for board gamers managing physical shelves).
- Add "Log a Play" logic (tracking session details).

### Phase 4: Social & Unification (Weeks 8-10)
- Unified Activity Feed mapping across `tracking_entries` and `diary_entries`.
- Polymath Lists: Building the drag-and-drop UI to mix Movies, Books, and Games into the same list.
- User Stat Dashboards (e.g., Pages Read, Hours Watched, Hours Played).

### Phase 5: Imports & Power Tools (Weeks 11+)
- Import from Letterboxd (CSV).
- Import from Goodreads (CSV).
- Import from BGG (Username scrape/API pull).
- Mobile responsive optimizations.

---

## 7. Crucial Edge Cases Addressed

1. **Progress Bars are Vertical-Dependent:**
   - Watch Progress = Episodes Watched / Total Episodes
   - Read Progress = Pages Read / Total Pages
   - Play Progress = Total Plays (no max value, just an incrementing integer)
   
2. **Search Ambiguity:** 
   - Searching "Dune" returns Frank Herbert's novel, Denis Villeneuve's film, David Lynch's film, and the board game. The search flyout must clearly use visual badges (icons: 🎬, 📚, 🎲) and subtitles (Author vs Director vs Designer) to differentiate.

3. **BGG API Quirk:** 
   - BGG uses a clunky, rate-limited XML API. You must rely heavily on Redis queuing/caching via BullMQ. When a user searches for a board game, hit an optimized proxy or Board Game Atlas first for search speed, and BGG for deep metadata in the background.

4. **Book Editions:**
   - Books suffer from having hundreds of editions (Hardcover, Paperback, Kindle, Audiobook). Initial MVP should default to the most popular/primary edition on Google Books. Future phases can allow users to "Swap Edition".
