# Inkreel: High-Performance Personal Diary Roadmap

To make Inkreel "Superfast" and a premier personal diary for everyone, we need to move beyond standard web patterns and into **Local-First, Edge-Cached** territory.

## 1. Speed & Architecture
### **A. Local-First Synchronization**
- **Current:** Browser -> Server Action -> DB -> Page Refresh.
- **Goal:** Browser -> Local IndexedDB -> Background Sync.
- **Why:** This makes interactions **instant** (0ms latency). The "Michael" movie will turn red immediately, even if the database is offline. We use **Zustand Persistence** (already implemented) as the first step toward this.

### **B. Partial Prerendering (PPR)**
- Next.js's PPR allows us to serve the **Shell** (layout, sidebar, header) instantly from a CDN, and stream the dynamic diary entries in as they load.
- This gives the user an immediate sense of "The site is open" while the data fetches.

### **C. Image Optimization**
- We already use Next.js `Image`, but we should pre-generate **BlurDataURLs** (tiny 10px placeholders) and store them in the DB.
- **Result:** You see a beautiful, blurred artistic silhouette of the poster before the high-res image snaps in.

## 2. The Personal Diary Experience
### **A. User Accounts (Login)**
- **Yes, we need this.** To make it a "Personal Diary for everyone," we need **NextAuth** or **Clerk**.
- Each user gets their own `user_id` column in the database, ensuring your "Watched" list is private to you.

### **B. Rich Journaling**
- Add a `review` or `notes` field (Rich Text) to the `logs` table.
- Instead of just "Watched," let users write "Watched with Michael; we both cried."

### **C. Discovery Engine**
- Store "User Genres" in a summary table.
- Use this to show "Random Movies from your favorite genre" on the home screen, making the site feel alive every time you open it.

## 3. Tech Stack Requirements
- **Database:** Keep PostgreSQL (Supabase/Vercel) for the master copy, but use **SQLite (via PGLite)** in the browser for instant offline reads.
- **Caching:** Use `unstable_cache` with specific tags for each user, so refreshing the diary is nearly instantaneous.

## 4. Missing Pieces
- **Import/Export:** Let users import from Letterboxd or Goodreads to avoid starting from zero.
- **Mobile PWA:** Install Inkreel as a "Home Screen App" so it feels like a native diary on your phone.
