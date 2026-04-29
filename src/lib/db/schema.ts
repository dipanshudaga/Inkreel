import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

// 1. User Identity
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
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
  blurDataUrl: text("blur_data_url"),
  
  // Description
  description: text("description"),
  
  // Status
  status: text("status").notNull(), // "watchlist", "shelf", "completed", "loved"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
