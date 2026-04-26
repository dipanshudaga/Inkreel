import { 
  sqliteTable, 
  text, 
  integer, 
  real,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// UNIFIED MEDIA ITEMS
export const media = sqliteTable("media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(), // 'watch', 'read', 'play'
  subType: text("sub_type"), // e.g., 'movie', 'tv', 'book', 'board_game'
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),

  // External IDs
  tmdbId: integer("tmdb_id"),
  anilistId: integer("anilist_id"),
  googleBooksId: text("google_books_id"),
  isbn13: text("isbn13"),
  bggId: integer("bgg_id"),

  // Shared Metadata
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  year: integer("year"),
  creator: text("creator"), // Director, Author, or Designer
  description: text("description"),
  genres: text("genres"), // Store as JSON string or comma-separated

  // Category-Specific Metadata
  duration: integer("duration"), // mins or board game playtime
  pageCount: integer("page_count"),
  minPlayers: integer("min_players"),
  maxPlayers: integer("max_players"),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// EPISODES (Watch Only)
export const episodes = sqliteTable("episodes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mediaId: text("media_id").references(() => media.id),
  seasonNumber: integer("season_number"),
  episodeNumber: integer("episode_number"),
  title: text("title"),
  airDate: text("air_date"),
});

// USERS
export const users = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  image: text("image"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// UNIFIED TRACKING
export const trackingEntries = sqliteTable("tracking_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  mediaId: text("media_id").references(() => media.id),

  status: text("status"), // 'planned', 'in_progress', 'completed', 'paused', 'dropped'
  rating: real("rating"), // 0.5 to 5.0
  isLiked: integer("is_liked", { mode: "boolean" }).default(0),

  progress: integer("progress"), // current ep or current page
  totalExpected: integer("total_expected"),
  
  owned: integer("owned", { mode: "boolean" }).default(0), // Physical collection

  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// UNIFIED DIARY LOGS
export const diaryEntries = sqliteTable("diary_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  mediaId: text("media_id").references(() => media.id),
  episodeId: text("episode_id").references(() => episodes.id),

  loggedDate: text("logged_date").notNull(),
  actionType: text("action_type"), // 'watched_full', 'read_pages', etc.
  amountProgressed: integer("amount_progressed"),

  rating: real("rating"),
  reviewText: text("review_text"),
  rewatchReread: integer("rewatch_reread", { mode: "boolean" }).default(0),
  
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  diaryEntries: many(diaryEntries),
  trackingEntries: many(trackingEntries),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  diaryEntries: many(diaryEntries),
  trackingEntries: many(trackingEntries),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
  }),
  media: one(media, {
    fields: [diaryEntries.mediaId],
    references: [media.id],
  }),
}));

export const trackingEntriesRelations = relations(trackingEntries, ({ one }) => ({
  user: one(users, {
    fields: [trackingEntries.userId],
    references: [users.id],
  }),
  media: one(media, {
    fields: [trackingEntries.mediaId],
    references: [media.id],
  }),
}));
