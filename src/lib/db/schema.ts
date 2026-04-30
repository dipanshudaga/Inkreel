import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

// 1. User Identity
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  
  // Feature 2: Goals
  movieGoal: integer("movie_goal").default(0).notNull(),
  bookGoal: integer("book_goal").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Media Archive (The Final Truth)
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  
  // Basic Metadata
  title: text("title").notNull(),
  tagline: text("tagline"), // For Movies/TV
  subtitle: text("subtitle"), // For Books
  
  // Categorization
  category: text("category").notNull(), // "watch" | "read"
  type: text("type").notNull(), // "movie", "anime", "book", etc.
  format: text("format"), // "OVA", "Miniseries", "TV Series", etc.
  
  // Credits & Stats
  creator: text("creator"), // Director or Author
  genres: text("genres"),
  language: text("language"), // Original Language name
  releaseYear: integer("release_year"),
  runtime: integer("runtime"), // In minutes
  pageCount: integer("page_count"),
  
  // Imagery
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  
  // Description
  description: text("description"),
  
  // Status
  status: text("status").notNull(), // "watchlist", "shelf", "completed", "loved"
  
  // Granular Timestamps
  watchlistedAt: timestamp("watchlisted_at"),
  completedAt: timestamp("completed_at"),
  favoritedAt: timestamp("favorited_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Activity Logs
export const logs = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  progress: integer("progress"),
  notes: text("notes"),
  date: text("date").notNull(),
  action: text("action").notNull(), // "progress_update", "status_change", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
