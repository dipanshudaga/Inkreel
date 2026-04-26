import { 
  pgTable, 
  text, 
  integer, 
  real,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'movie', 'tv', 'anime', 'book', 'manga'
  category: text("category"), // compatible with older version
  
  // External API linkage
  externalId: text("external_id").notNull(), // TMDB ID, AniList ID, or OpenLibrary ID
  
  // Cached Metadata (to show in grids without re-fetching)
  title: text("title").notNull(),
  slug: text("slug"),
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  releaseYear: integer("release_year"),
  year: integer("year"), // compatible with older version
  creator: text("creator"), // Director or Author
  description: text("description"),
  runtime: integer("runtime"), // duration in minutes or pages
  genres: text("genres"), // comma separated

  // Tracking state for this user
  status: text("status").notNull().default('plan_to_watch'), 
  rating: real("rating"), // 0.5 to 5.0
  reviewText: text("review_text"),
  
  startedAt: text("started_at"), // ISO date string
  completedAt: text("completed_at"), // ISO date string

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Logs for tracking individual sessions or rewatches/rereads
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: uuid("media_id").references(() => media.id).notNull(),
  
  date: text("date").notNull(), // ISO date string
  action: text("action").notNull(), // 'watched_episode', 'read_pages', 'rewatched', 'finished'
  progress: integer("progress"), // e.g. Episode 4, Page 120
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mediaRelations = relations(media, ({ many }) => ({
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  media: one(media, {
    fields: [logs.mediaId],
    references: [media.id],
  }),
}));
