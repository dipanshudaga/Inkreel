# Traced v3 — Product Requirements Document

## 1. Product Vision & Philosophy
**Concept:** Traced is a private, local-first personal database for tracking watched and read media. 
**Target Audience:** Casual viewers and readers who want a single, organized place to keep a list of their media without complex features, social networks, or subscriptions.
**Design Philosophy:** "Spreadsheet-like". The app should feel highly functional, organized, and data-dense. It prioritizes clean utilitarian design over flashy visuals, ensuring the user can easily view and manage their lists.
**Privacy & Ownership:** 100% private and local-first. All data is stored locally on the user's machine (e.g., via SQLite). No cloud accounts, no subscriptions, and complete data ownership.

## 2. Core Architecture
The application is strictly designed for **Desktop** and is split into three main areas:

1. **Home Screen:** A simple, welcoming entry point. Instead of a complex unified dashboard, it features a pleasant greeting and a randomized display of movies and books just to make the app feel lively.
2. **Watch Diary:** A dedicated, isolated silo for tracking Movies, TV Shows, and Anime.
3. **Read Diary:** A dedicated, isolated silo for tracking Books and Manga.

*(Note: Custom lists, stats/insights, and social sharing are explicitly excluded to keep the app focused and lightweight).*

## 3. Key Features & Workflows

### 3.1 The Logging Experience
- **Frictionless Quick-Log:** A simple 1-click action to quickly add an item to your diary (e.g., "Mark as Watched" or "Mark as Read").
- **Detailed Log (Optional):** Users can open a detailed log sheet for an item to add a text review, specific dates, and a rating.
- **Rating System:** 5-star system, supporting half-stars (0.5 to 5.0).
- **Standard Statuses:** 
  - Watch: *Currently Watching, Completed, On Hold, Dropped, Plan to Watch*
  - Read: *Currently Reading, Completed, On Hold, Dropped, Plan to Read*

### 3.2 Watch Diary
- **Supported Media:** Movies, TV Series, Anime.
- **APIs:** 
  - TMDB (The Movie Database) for Movies and TV.
  - AniList (GraphQL) for Anime.
- **Views:** A clean, spreadsheet-like list or dense grid displaying poster, title, rating, and status.
- **Filtering:** Filter by Status, Rating, or Media Type.

### 3.3 Read Diary
- **Supported Media:** Books, Manga.
- **APIs:** 
  - **OpenLibrary API** for Books. *(Note: Goodreads officially retired its public API in 2020 and it is no longer accessible. OpenLibrary is the best free, open alternative that provides extensive book metadata and covers).*
  - AniList (GraphQL) for Manga.
- **Views:** Similar spreadsheet-like list/grid as the Watch Diary.
- **Filtering:** Filter by Status, Rating, or Media Type.

### 3.4 Data Import
- **CSV Imports:** Users can migrate their existing data into their local database.
  - Letterboxd (`diary.csv`)
  - Goodreads (`library_export.csv`)

## 4. Technical Specifications
- **Platform:** Desktop-first Web App (or packaged as a local desktop app via Electron/Tauri).
- **Frontend:** React (Next.js or Vite).
- **Styling:** Vanilla CSS or Tailwind. The UI should use a clean, minimal, monochrome palette with borders and structured tables to achieve the "spreadsheet" feel.
- **Database:** Local SQLite database. No external BaaS (like Supabase or Firebase) to ensure true local-first data ownership.
