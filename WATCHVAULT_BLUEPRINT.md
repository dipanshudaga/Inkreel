# WatchVault — Open Source Letterboxd for Everything
### Complete Build Blueprint · Movies · TV Series · Web Series · Anime · OVAs · Specials

---

## 0. What This Is

A self-hostable, community-driven media tracking and discovery platform — inspired by **Letterboxd's UI** but built to handle **everything**: movies, TV series, web series, anime series, anime movies, OVAs, specials, and miniseries. Key differentiators over Letterboxd:

- Full episode-level and season-level tracking for series
- Anime handled as first-class content (not bolted on)
- Diary works for both films AND individual episodes
- Social features: reviews, lists, follows, activity feeds
- Open source, self-hostable, fully yours

---

## 1. Reference Repos (Study These First)

### Primary References — Fork / Gut / Borrow Heavily

| Repo | Why It Matters | Stars | License |
|---|---|---|---|
| [FuzzyGrim/Yamtrack](https://github.com/FuzzyGrim/Yamtrack) | Best open-source backend for multi-type tracking (movies, TV, anime, manga, games). Episode-level tracking, AniList + TMDB + TVDB imports, Jellyfin webhooks | ~1.6k | AGPL-3.0 |
| [sbondCo/Watcharr](https://github.com/sbondCo/Watcharr) | Best UI among open-source trackers. Go + SvelteKit. Clean, dark, modern. Episode tracking, user auth, Docker-first | ~2k | MIT |
| [bonukai/MediaTracker](https://github.com/bonukai/MediaTracker) | Full-featured Node.js + TypeScript tracker. TV seasons + episodes, calendar, notifications. REST API | ~1.5k | MIT |
| [leepeuker/movary](https://github.com/leepeuker/movary) | Best Letterboxd feature parity (diary, stats, Trakt import). PHP but study the data model | ~600 | AGPL-3.0 |
| [ddanielsantos/cloneboxd](https://github.com/ddanielsantos/cloneboxd) | Clean Letterboxd UI clone in JS. Study the component layout and card system | ~200 | MIT |
| [janaiscoding/letterboxd-clone](https://github.com/janaiscoding/letterboxd-clone) | React + Firebase Letterboxd clone. Best reference for profile pages, film cards, watchlist UX | ~150 | MIT |

### Secondary References — Borrow Specific Pieces

| Repo | What To Take |
|---|---|
| [Sorracha-A/Letterboxd-Clone](https://github.com/Sorracha-A/Letterboxd-Clone) | MongoDB schema design for reviews + watchlist |
| [anime-offline-database](https://github.com/manami-project/anime-offline-database) | Cross-reference JSON for MAL ↔ AniList ↔ TVDB ↔ TMDB ID mapping |
| [Anime-Lists/anime-lists](https://github.com/Anime-Lists/anime-lists) | AniDB ↔ TVDB ↔ TMDB episode mapping (crucial for correct episode numbering) |

---

## 2. Tech Stack Decision

This stack was chosen for developer velocity, TypeScript end-to-end, strong ecosystem, and Letterboxd-level UI capability.

```
Frontend      →  Next.js 15 (App Router) + TypeScript
UI Library    →  shadcn/ui + Tailwind CSS v4
Animations    →  Framer Motion
Backend       →  Next.js API Routes + tRPC (type-safe end-to-end)
Auth          →  NextAuth.js v5 (email + OAuth: Google, GitHub)
Database      →  PostgreSQL (primary) via Neon or Supabase
ORM           →  Drizzle ORM (fast, type-safe, migration-friendly)
Caching       →  Redis (Upstash or self-hosted) for metadata + sessions
Search        →  Meilisearch (self-hostable, fast fuzzy search)
File Storage  →  Cloudflare R2 or MinIO (user avatars, custom posters)
Job Queue     →  BullMQ (metadata refresh, notifications, import jobs)
Deployment    →  Docker Compose (self-host) or Vercel + Neon (cloud)
```

### Why Not Other Stacks?

- **Not PHP/Django** — Yamtrack is great but Python/Django slows UI iteration
- **Not Go+Svelte (Watcharr)** — Great app but harder to customize UI to Letterboxd fidelity
- **Not Firebase** — No self-hosting, vendor lock-in
- **Not Prisma** — Drizzle is faster and generates cleaner SQL for complex queries (stats, rankings)

---

## 3. External APIs & Data Sources

### Primary Data Sources

| API | Covers | Key Notes |
|---|---|---|
| [TMDB API v3](https://developer.themoviedb.org/docs) | Movies, TV series, seasons, episodes, cast, crew, images | Free with account. 50 req/sec. Covers most Western content + anime |
| [AniList GraphQL API](https://docs.anilist.co/) | Anime, manga. 500k+ entries. Episode data, studios, genres | Free, no key required. 90 req/min |
| [Jikan REST API](https://jikan.moe/) | MyAnimeList unofficial REST wrapper | Free, no key. Use as fallback for MAL data |
| [TVDB API v4](https://thetvdb.com/api-information) | TV episodes, seasons, artwork | Requires subscription key. Use for TVDB-specific shows |

### ID Mapping (Critical for Anime)
Anime exists on multiple databases with different episode numbering. Use these to link them:

- **[anime-lists](https://github.com/Anime-Lists/anime-lists)** — AniDB ↔ TVDB episode mapping XML
- **[anime-offline-database](https://github.com/manami-project/anime-offline-database)** — JSON cross-ref: MAL ID ↔ AniList ID ↔ TMDB ID ↔ AniDB ID
- **[arm-server](https://github.com/kawaiioverflow/arm-server)** — Hosted API for AniList ↔ MAL ↔ AniDB ID resolution

### Import Sources (for existing user data)

| Source | Method |
|---|---|
| Letterboxd | CSV export upload |
| Trakt | OAuth import via Trakt API |
| MyAnimeList | XML export upload |
| AniList | GraphQL OAuth import |
| SIMKL | API import |

---

## 4. Database Schema (Drizzle ORM / PostgreSQL)

```sql
-- USERS
users
  id            uuid PRIMARY KEY
  username      text UNIQUE
  email         text UNIQUE
  password_hash text
  avatar_url    text
  bio           text
  is_private    boolean DEFAULT false
  created_at    timestamp

-- MEDIA (unified table for all content types)
media
  id            uuid PRIMARY KEY
  media_type    enum('movie', 'tv', 'anime', 'anime_movie', 'ova', 'special', 'web_series', 'miniseries')
  title         text
  original_title text
  slug          text UNIQUE        -- for URLs: /film/spirited-away
  tmdb_id       integer
  anilist_id    integer
  mal_id        integer
  imdb_id       text
  tvdb_id       integer
  year          integer
  poster_url    text
  backdrop_url  text
  overview      text
  genres        text[]
  runtime       integer            -- minutes (movies) or avg episode runtime
  status        enum('released','ongoing','upcoming','ended')
  country       text
  language      text
  updated_at    timestamp

-- SEASONS (for TV/anime series)
seasons
  id            uuid PRIMARY KEY
  media_id      uuid REFERENCES media(id)
  season_number integer
  title         text
  overview      text
  air_date      date
  poster_url    text
  episode_count integer
  tmdb_season_id integer

-- EPISODES
episodes
  id            uuid PRIMARY KEY
  season_id     uuid REFERENCES seasons(id)
  media_id      uuid REFERENCES media(id)
  episode_number integer
  title         text
  overview      text
  air_date      date
  runtime       integer
  still_url     text              -- episode thumbnail

-- USER TRACKING (the core table)
tracking_entries
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  media_id      uuid REFERENCES media(id)
  status        enum('watched','watching','planned','paused','dropped')
  rating        decimal(3,1)     -- 0.5 to 5.0 (half-stars like Letterboxd)
  liked         boolean
  rewatch_count integer DEFAULT 0
  started_at    date
  finished_at   date
  created_at    timestamp
  updated_at    timestamp

-- EPISODE TRACKING
episode_tracking
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  episode_id    uuid REFERENCES episodes(id)
  watched_at    timestamp
  runtime_watched integer         -- for partial watches

-- DIARY ENTRIES (Letterboxd-style log)
diary_entries
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  media_id      uuid REFERENCES media(id)
  episode_id    uuid REFERENCES episodes(id) NULL  -- null = full movie/show
  watched_date  date
  rewatch       boolean DEFAULT false
  rating        decimal(3,1)
  created_at    timestamp

-- REVIEWS
reviews
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  media_id      uuid REFERENCES media(id)
  body          text
  rating        decimal(3,1)
  contains_spoilers boolean DEFAULT false
  liked_count   integer DEFAULT 0
  created_at    timestamp
  updated_at    timestamp

-- LISTS
lists
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  title         text
  description   text
  is_public     boolean DEFAULT true
  is_ranked     boolean DEFAULT false
  created_at    timestamp

list_items
  id            uuid PRIMARY KEY
  list_id       uuid REFERENCES lists(id)
  media_id      uuid REFERENCES media(id)
  position      integer
  note          text

-- SOCIAL
follows
  follower_id   uuid REFERENCES users(id)
  following_id  uuid REFERENCES users(id)
  created_at    timestamp
  PRIMARY KEY (follower_id, following_id)

review_likes
  user_id       uuid REFERENCES users(id)
  review_id     uuid REFERENCES reviews(id)
  PRIMARY KEY (user_id, review_id)

-- ACTIVITY FEED
activity
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  activity_type enum('watched','reviewed','liked','list_created','list_updated','followed')
  media_id      uuid REFERENCES media(id) NULL
  review_id     uuid REFERENCES reviews(id) NULL
  list_id       uuid REFERENCES lists(id) NULL
  target_user_id uuid REFERENCES users(id) NULL
  created_at    timestamp
```

---

## 5. Project File Structure

```
watchvault/
├── apps/
│   └── web/                        # Next.js app
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (main)/
│       │   │   ├── page.tsx             # Homepage / feed
│       │   │   ├── film/[slug]/         # Movie detail page
│       │   │   ├── show/[slug]/         # TV/Anime show page
│       │   │   │   └── season/[n]/      # Season page
│       │   │   │       └── episode/[n]/ # Episode page
│       │   │   ├── members/[username]/  # User profile (Letterboxd-style)
│       │   │   │   ├── page.tsx         # Profile overview
│       │   │   │   ├── films/           # All watched films
│       │   │   │   ├── diary/           # Watch diary
│       │   │   │   ├── lists/           # User's lists
│       │   │   │   └── reviews/         # User's reviews
│       │   │   ├── lists/[id]/          # List detail page
│       │   │   ├── search/              # Search results
│       │   │   └── discover/            # Discovery / trending
│       │   └── api/
│       │       └── trpc/[trpc]/         # tRPC handler
│       ├── components/
│       │   ├── media/
│       │   │   ├── MediaCard.tsx        # Poster card (Letterboxd grid style)
│       │   │   ├── MediaHero.tsx        # Detail page hero
│       │   │   ├── EpisodeList.tsx      # Season/episode accordion
│       │   │   ├── StarRating.tsx       # Half-star rating widget
│       │   │   └── TrackingButton.tsx   # Add to list / mark watched
│       │   ├── user/
│       │   │   ├── ProfileHeader.tsx
│       │   │   ├── ActivityFeed.tsx
│       │   │   └── DiaryRow.tsx
│       │   ├── social/
│       │   │   ├── ReviewCard.tsx
│       │   │   └── ListCard.tsx
│       │   └── ui/                      # shadcn/ui re-exports
│       └── lib/
│           ├── db/
│           │   ├── schema.ts            # Drizzle schema
│           │   └── index.ts             # DB client
│           ├── api/
│           │   ├── tmdb.ts              # TMDB API wrapper
│           │   ├── anilist.ts           # AniList GraphQL client
│           │   └── jikan.ts             # Jikan (MAL) wrapper
│           ├── trpc/
│           │   ├── routers/
│           │   │   ├── media.ts
│           │   │   ├── tracking.ts
│           │   │   ├── reviews.ts
│           │   │   ├── lists.ts
│           │   │   └── users.ts
│           │   └── index.ts
│           └── jobs/                    # BullMQ job definitions
│               ├── refreshMetadata.ts
│               └── importLibrary.ts
├── packages/
│   └── db/                         # Shared DB package (monorepo)
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## 6. Feature Spec — Build in This Order

### Phase 1 — Core MVP (Weeks 1–4)

**Authentication**
- [ ] Email/password registration + login (NextAuth credentials)
- [ ] Google OAuth
- [ ] JWT sessions

**Media Ingestion**
- [ ] TMDB sync for movies: `/movie/{id}` → populate `media` table
- [ ] TMDB sync for TV: `/tv/{id}` with all seasons + episodes
- [ ] AniList sync for anime: GraphQL query → populate `media`, `seasons`, `episodes`
- [ ] ID cross-mapping: store both `tmdb_id` AND `anilist_id` on same row where possible
- [ ] Background job (BullMQ) to refresh stale metadata weekly

**Tracking**
- [ ] Mark as watched / watching / planned / dropped
- [ ] Half-star rating (0.5 → 5.0)
- [ ] "Like" a film (heart, like Letterboxd)
- [ ] Episode-level check-off for series (season accordion UI)
- [ ] Auto-advance to next episode when marking done

**UI Pages (Letterboxd parity)**
- [ ] `/film/[slug]` — Movie detail: poster, backdrop, cast, ratings histogram, recent reviews
- [ ] `/show/[slug]` — Show overview with season list
- [ ] `/show/[slug]/season/[n]` — Season detail with episode grid
- [ ] `/members/[username]` — Profile: stats (films watched, hours, avg rating), recent activity
- [ ] `/members/[username]/films` — Poster grid with filter/sort
- [ ] `/members/[username]/diary` — Chronological watch log
- [ ] Search page (TMDB search + AniList search, unified)

---

### Phase 2 — Social (Weeks 5–7)

**Reviews**
- [ ] Write review (markdown editor with spoiler toggle)
- [ ] Like reviews
- [ ] Review comments (threaded, 2 levels)
- [ ] Popular reviews on media page

**Lists**
- [ ] Create named lists (ranked or unranked)
- [ ] Add/remove/reorder media in lists
- [ ] List detail page (poster grid)
- [ ] List likes + comments

**Following**
- [ ] Follow/unfollow users
- [ ] Activity feed: shows watched, reviews, lists from people you follow
- [ ] "Friends watched" panel on media detail pages

---

### Phase 3 — Discovery & Stats (Weeks 8–10)

**Discovery**
- [ ] Trending this week (TMDB trending endpoint)
- [ ] New anime this season (AniList `season` query)
- [ ] Popular among people you follow
- [ ] Genre browsing by type (filter by movie/anime/TV/etc.)
- [ ] Advanced search: filter by year, genre, country, language, status

**User Stats (the fun Letterboxd stuff)**
- [ ] Total films watched, hours watched
- [ ] Watching streak (days in a row with a diary entry)
- [ ] Ratings distribution chart (bar histogram)
- [ ] Genre breakdown pie/radar chart
- [ ] Decade breakdown
- [ ] Most watched directors / studios / voice actors
- [ ] Year-in-review page (à la Spotify Wrapped)

---

### Phase 4 — Power Features (Weeks 11–14)

**Series-Specific (where we beat Letterboxd)**
- [ ] Per-episode ratings and mini-reviews
- [ ] "Currently Watching" widget with next episode button
- [ ] Season rating (separate from show rating)
- [ ] Rewatch tracking per season
- [ ] Episode air date calendar (subscribe via `.ics`)

**Import / Export**
- [ ] Import from Letterboxd CSV (map to `media` + `diary_entries`)
- [ ] Import from MAL XML
- [ ] Import from AniList (OAuth GraphQL)
- [ ] Import from Trakt (OAuth API)
- [ ] Export your data as CSV at any time

**Notifications (via Apprise)**
- [ ] New episode of a watching show dropped
- [ ] Upcoming release of a "planned" movie
- [ ] A user you follow reviewed something
- [ ] Channels: Discord, Telegram, ntfy, email

---

## 7. UI Design Guide (Letterboxd-like)

### Color System (Dark Mode Primary)

```css
:root {
  --bg-primary:     #14181c;   /* near-black, Letterboxd's bg */
  --bg-secondary:   #1c2228;   /* cards, sidebars */
  --bg-elevated:    #2c3440;   /* hover states, modals */
  --accent-green:   #00c030;   /* Letterboxd's signature green → adapt to your brand */
  --text-primary:   #9ab;      /* body text (desaturated blue-gray) */
  --text-bright:    #def;      /* headings, important text */
  --text-muted:     #678;      /* timestamps, secondary */
  --border:         #456;      /* subtle borders */
  --rating-gold:    #f5c518;   /* star ratings */
}
```

### Typography

```css
/* Display: for titles and headings */
font-family: 'Raleway', sans-serif;  /* or 'Titillium Web' */
/* Body: clean reading */
font-family: 'Source Sans 3', sans-serif;
```

### Key UI Patterns

**MediaCard** (the cornerstone component)
```tsx
// Poster card — appears in grids, lists, search results
// Hover: show rating stars + quick-add button overlay
// Shows: poster image, title below (optional), rating dot

<div className="group relative aspect-[2/3] rounded overflow-hidden">
  <Image src={poster} fill alt={title} className="object-cover" />
  
  {/* Hover overlay */}
  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                  transition-opacity flex flex-col justify-end p-2">
    <StarRating value={userRating} onChange={handleRate} />
    <button onClick={handleWatched}>✓ Watched</button>
  </div>
  
  {/* Watched indicator */}
  {isWatched && (
    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" />
  )}
</div>
```

**EpisodeList** (series-specific, our killer feature)
```tsx
// Accordion per season
// Each episode row: number, title, air date, duration, watched checkbox, mini-rating
// Progress bar at season level
// "Mark all watched" button
```

**DiaryRow** (Letterboxd diary style)
```
[Month] [Day]   [Poster thumb]   [Title · Year]   [★★★½]   [♥]   [Rewatch↩]
                [Episode info if TV]
```

**Profile Header**
```
[Avatar]  [Username]   [Following] [Follow button]
Stats: 847 Films · 143 Shows · 42 Anime · 1,240h watched
[Recent posters as a visual strip]
```

---

## 8. Critical Implementation Notes

### Anime Episode Numbering Problem
TMDB and AniList number episodes differently for long-running anime (Naruto, One Piece, Dragon Ball). Solution:

```typescript
// In your media fetch logic:
async function getAnimeEpisodes(anilistId: number, tmdbId: number) {
  // 1. Fetch AniList for canonical episode count + info
  const anilistData = await fetchAniList(anilistId);
  
  // 2. Fetch TMDB for rich episode thumbnails (stills) + English titles
  const tmdbData = await fetchTMDB(tmdbId);
  
  // 3. Merge: use AniList structure, fill in TMDB assets
  // 4. For numbering conflicts, prefer AniList (it matches MAL, the anime standard)
  
  return mergeEpisodeData(anilistData, tmdbData);
}
```

Use the **anime-lists** cross-reference to map between the two numbering systems.

### Media Type Disambiguation
When a user searches "Ghost in the Shell", they might get:
- The 1995 film (movie)
- Stand Alone Complex (anime TV series)
- The 2017 live-action remake (movie)

Display all with type badges: `[Anime]` `[Film]` `[Series]`

```typescript
type MediaType = 
  | 'movie'       // Standard films
  | 'tv'          // Live-action TV series
  | 'anime'       // Anime series (AniList type: TV)
  | 'anime_movie' // Anime films (AniList type: MOVIE)
  | 'ova'         // OVAs
  | 'special'     // Specials
  | 'web_series'  // YouTube/streaming-native series
  | 'miniseries'; // Limited series (< 10 eps, ends)
```

### Series Progress Calculation

```typescript
function getSeriesProgress(userId: string, mediaId: string) {
  const totalEpisodes = await db.episodes.count({ mediaId });
  const watchedEpisodes = await db.episodeTracking.count({ userId, 
    episode: { mediaId } });
  
  return {
    total: totalEpisodes,
    watched: watchedEpisodes,
    percent: Math.round((watchedEpisodes / totalEpisodes) * 100),
    nextEpisode: await getNextUnwatchedEpisode(userId, mediaId)
  };
}
```

### Rating System
Match Letterboxd exactly: **half-star, 0.5 to 5.0** (stored as `DECIMAL(3,1)`).

Separate concepts:
- **Rating** = explicit star rating (optional)
- **Liked** = heart/like (binary, separate from rating)
- These are independent — you can like without rating, or rate without liking

---

## 9. Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://watchvault:secret@db:5432/watchvault
      REDIS_URL: redis://redis:6379
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      TMDB_API_KEY: ${TMDB_API_KEY}
      MEILISEARCH_URL: http://meilisearch:7700
      MEILISEARCH_KEY: ${MEILISEARCH_KEY}
    depends_on:
      - db
      - redis
      - meilisearch

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: watchvault
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: watchvault
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:latest
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "7700:7700"

  worker:
    build: ./apps/web
    command: node dist/worker.js
    environment:
      DATABASE_URL: postgresql://watchvault:secret@db:5432/watchvault
      REDIS_URL: redis://redis:6379
      TMDB_API_KEY: ${TMDB_API_KEY}
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

---

## 10. tRPC Router Quick Reference

```typescript
// lib/trpc/routers/media.ts
export const mediaRouter = createTRPCRouter({
  // Search across all types
  search: publicProcedure
    .input(z.object({ query: z.string(), type: MediaTypeEnum.optional() }))
    .query(async ({ input }) => { ... }),

  // Get media detail (movie or show)
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => { ... }),

  // Get all seasons for a show
  seasons: publicProcedure
    .input(z.object({ mediaId: z.string() }))
    .query(async ({ input }) => { ... }),

  // Get episodes for a season
  episodes: publicProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(async ({ input }) => { ... }),
});

// lib/trpc/routers/tracking.ts
export const trackingRouter = createTRPCRouter({
  // Mark movie/show as watched
  markWatched: protectedProcedure
    .input(z.object({ mediaId: z.string(), rating: z.number().optional() }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Track a single episode
  markEpisodeWatched: protectedProcedure
    .input(z.object({ episodeId: z.string() }))
    .mutation(async ({ ctx, input }) => { ... }),

  // Get user's tracking status for a piece of media
  getStatus: protectedProcedure
    .input(z.object({ mediaId: z.string() }))
    .query(async ({ ctx, input }) => { ... }),

  // Get series progress
  getProgress: protectedProcedure
    .input(z.object({ mediaId: z.string() }))
    .query(async ({ ctx, input }) => { ... }),
});
```

---

## 11. Environment Variables

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/watchvault

# Cache
REDIS_URL=redis://localhost:6379

# APIs
TMDB_API_KEY=your_tmdb_v3_api_key
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_v4_read_token
# AniList needs no key (public GraphQL)
JIKAN_BASE_URL=https://api.jikan.moe/v4

# Search
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=your_master_key

# Auth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Storage (for user avatars)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=watchvault-assets
```

---

## 12. Build Order (Day by Day)

### Week 1 — Foundation
- Day 1: Scaffold Next.js 15 app with shadcn/ui, Drizzle, NextAuth
- Day 2: Write full Drizzle schema, run migrations, seed test data
- Day 3: TMDB API wrapper (movies + TV shows + seasons + episodes)
- Day 4: AniList GraphQL client + ID mapping logic
- Day 5: Background worker (BullMQ) for metadata jobs

### Week 2 — Core Tracking
- Day 1-2: Auth pages (login, register, profile setup)
- Day 3: `tracking_entries` tRPC routes + DB operations
- Day 4: `episode_tracking` tRPC routes + progress calculation
- Day 5: `diary_entries` tRPC routes

### Week 3 — Core Pages
- Day 1-2: Film/Movie detail page (hero, cast, reviews section)
- Day 3-4: TV/Anime show page + Season page + Episode list
- Day 5: User profile page + watched grid

### Week 4 — Polish MVP
- Day 1: Search (Meilisearch integration + TMDB live search)
- Day 2: StarRating component, TrackingButton, MediaCard grid
- Day 3: Diary page (chronological, grouped by month)
- Day 4-5: Basic stats page, Docker Compose, test deployment

### Week 5–7 — Social Layer
Reviews, lists, follows, activity feed (see Phase 2 above)

### Week 8–10 — Discovery + Stats
(see Phase 3 above)

---

## 13. API Rate Limits & Caching Strategy

```
TMDB:     50 req/sec  →  Cache media metadata for 24h in Redis
AniList:  90 req/min  →  Cache for 12h, re-fetch on user request only
Jikan:    3 req/sec   →  Use only as MAL fallback, cache 48h

Cache keys:
  media:tmdb:{id}          → full TMDB response
  media:anilist:{id}       → full AniList response  
  media:episodes:{mediaId} → episode list
  search:{query}:{type}    → search results (TTL: 5 min)
  trending:{type}:{week}   → trending list (TTL: 6h)
```

---

## 14. Open Questions / Design Decisions Left For You

1. **Brand Name** — "WatchVault" is a placeholder. Pick something with soft letters (your 3D printing research showed you like L/M/V sounds). Ideas: *Velora*, *Lumaire*, *Archivio*

2. **Anime disambiguation** — When a user adds "Attack on Titan", do they add the franchise (1 entry) or each season separately (4 entries)? Recommendation: each AniList season is its own `media` entry (matches how AniList works), but link them via a `franchise_id` column.

3. **Community vs. Personal** — Do you want this public (multiple users) or single-user (personal Notion-for-media)? The schema supports both. Multi-user adds moderation complexity.

4. **Web Series** — YouTube originals, short-form series (Dropout, Nebula)? No standard API covers this well. Consider letting users manually add entries with a "custom" flag.

5. **Monetization** — If you go public: Letterboxd Pro equivalent (stats, custom themes) or fully free? Hosting costs on Neon + Vercel can be zero at small scale.

---

## 15. Useful Commands

```bash
# Create new Next.js project
npx create-next-app@latest watchvault --typescript --tailwind --app --src-dir

# Install core deps
npm install @trpc/server @trpc/client @trpc/next @tanstack/react-query
npm install drizzle-orm @neondatabase/serverless drizzle-kit
npm install next-auth@beta @auth/drizzle-adapter
npm install bullmq ioredis
npm install meilisearch

# Install shadcn/ui
npx shadcn@latest init

# Generate Drizzle migration
npx drizzle-kit generate
npx drizzle-kit migrate

# Study these before building:
# 1. Yamtrack codebase for data model inspiration
#    https://github.com/FuzzyGrim/Yamtrack/tree/main/src
# 2. Watcharr for UI component ideas
#    https://github.com/sbondCo/Watcharr/tree/dev/src
# 3. MediaTracker for REST API design
#    https://github.com/bonukai/MediaTracker/tree/main/server/src
```

---

*Blueprint version 1.0 — April 2026*  
*All referenced repos are open source. Check individual licenses before forking (most are MIT or AGPL-3.0).*
