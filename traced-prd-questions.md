# Traced PRD — Vision & Strategy Questionnaire

Please answer these questions in as much detail as you'd like. Feel free to skip any that don't apply or add thoughts that aren't covered here. Once you answer these, I will synthesize them into a robust, comprehensive PRD.

## 1. The Core Problem & Audience
* **What felt "off" or "not working" about the current PRD (v2)?** Was it too simple, too complex, missing the "magic", or structurally flawed?
i think structly very flawed, it doesn't have the right features
* **Who is the ideal user for Traced?** Is it for the casual viewer/reader, or the hardcore archivist who wants to track every detail?
it's for casual reader and watcher like me who just wanna have a list of all the things in on epalce
* **What is the primary emotional goal?** Should the app feel like a functional spreadsheet, a beautiful personal diary, or a motivating gamified tracker?
it should feel more like a spreadsheet

## 2. Architecture: Unified vs. Siloed
* **The "Two-Section" split:** PRD v2 completely separated "Watch" and "Read" into different silos. Did this feel too disconnected?
no this was fine they should be separate 
* **Unified Dashboard:** Would you prefer a unified "Home" screen that gives you a bird's-eye view of *everything* you are currently consuming (e.g., "Currently watching Shogun, currently reading Dune"), before diving into the specific Watch/Read diaries?
no i don't want unified home screen i just want a simple home screen that has some copy and showing ranodm movies and books below jsut ot make it more lively

## 3. Features: What to Keep, Cut, or Add
* **Stats & Insights:** v2 removed all stats. Users usually love looking back at their habits (e.g., "You read 40 books this year" or "Your most watched genre is Sci-Fi"). Should we bring back a beautiful, private stats/insights page?
no currently i don't want that
* **Lists / Collections:** v2 removed the ability to make custom lists. Do we need a way to group things (e.g., "All-time Favorites", "To Watch with Partner", "Summer Reading")?
no i don't want that too
* **Social / Sharing:** The app is private, but do you want the ability to generate a beautiful "Share Card" (an image of your review) to post on Twitter/Instagram?
no i don't want that as of now
* **New Media Types:** Do we plan to expand beyond Watch (Movies/TV/Anime) and Read (Books/Manga)? E.g., Video Games, Podcasts, Music?
no as of now this is enough 

## 4. The Logging Experience
* **Friction vs. Detail:** Should logging be a 1-click action ("Mark as watched"), or a detailed journal entry (Dates, Custom Tags, Re-watch count, rich-text review)?
should be one click to mark as watched/read but we should also have option to add more details like review
* **Rating System:** 5 stars (with half stars)? 10-point scale? Tier list (S/A/B/C/D)? No ratings, just vibes (Like/Dislike)?
5 stars with half stars

## 5. Technical Constraints & Data
* **Data Sources:** Are we locked in on TMDB (Movies/TV), AniList (Anime/Manga), and Google Books? Are there any other APIs you want to integrate?
im not sure about this because eariler we tried google books and its' not good, what data base goodreasds uses? maybe we can use that, it has most of the books and info 
* **Data Ownership (Local vs. Cloud):** Should this act as a "Local-First" app where the user owns their SQLite database file, or a standard cloud web-app (using Supabase/Firebase) with user accounts?
i prefer local first app as i don't want anyone to have access to my data and i don't want to pay for subscription too  

## 6. Mobile vs. Desktop
* We are designing for desktop first right now, but personal tracking is heavily a mobile use-case. Should the final PRD treat mobile as a first-class citizen (Responsive Web App / PWA) rather than an afterthought?
no let's keep desktop firstr only
---

**Next Steps:**
Reply directly in this file, or in the chat. Once you provide your insights, I will draft a massive, comprehensive `traced-prd-v3.md` that acts as our ultimate source of truth.
