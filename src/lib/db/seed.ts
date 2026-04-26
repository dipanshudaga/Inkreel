import { db } from "./index";
import { media, logs } from "./schema";

const sampleMedia = [
  {
    externalId: "tmdb_m_1",
    type: "movie",
    title: "Dune: Part Two",
    releaseYear: 2024,
    creator: "Denis Villeneuve",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqq9TrU.jpg",
    runtime: 166,
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    status: "completed",
    rating: 4.5,
  },
  {
    externalId: "ol_b_1",
    type: "book",
    title: "The Three-Body Problem",
    releaseYear: 2008,
    creator: "Liu Cixin",
    posterUrl: "https://covers.openlibrary.org/b/id/12836267-L.jpg",
    status: "completed",
    rating: 4.0,
  },
  {
    externalId: "ani_a_1",
    type: "anime",
    title: "Frieren: Beyond Journey's End",
    releaseYear: 2023,
    creator: "Keiichiro Saito",
    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-5z2n2Z2Z2z2Z.jpg",
    status: "watching",
  },
  {
    externalId: "tmdb_m_2",
    type: "movie",
    title: "Oppenheimer",
    releaseYear: 2023,
    creator: "Christopher Nolan",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    status: "completed",
    rating: 5.0,
  },
  {
    externalId: "ol_b_2",
    type: "book",
    title: "Sapiens: A Brief History of Humankind",
    releaseYear: 2011,
    creator: "Yuval Noah Harari",
    posterUrl: "https://covers.openlibrary.org/b/id/8288590-L.jpg",
    status: "completed",
    rating: 4.5,
  },
  {
    externalId: "ani_a_2",
    type: "manga",
    title: "Berserk",
    releaseYear: 1989,
    creator: "Kentaro Miura",
    posterUrl: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-30002.jpg",
    status: "reading",
  },
];

async function seed() {
  console.log("Seeding database (Postgres)...");
  
  // Clear existing data
  await db.delete(logs);
  await db.delete(media);

  const insertedMedia = [];

  for (const item of sampleMedia) {
    try {
      const [inserted] = await db.insert(media).values(item as any).returning();
      insertedMedia.push(inserted);
      console.log(`Inserted: ${item.title}`);
    } catch (e) {
      console.error(`Error inserting ${item.title}:`, e);
    }
  }

  // Add some specific items and logs
  const [shogun] = await db.insert(media).values({
    externalId: "tmdb_tv_1",
    type: "tv",
    title: "Shōgun",
    releaseYear: 2024,
    creator: "Justin Marks",
    posterUrl: "https://image.tmdb.org/t/p/w500/7WZZ12VA2BKT4T8SRATPRF69KH.jpg",
    status: "watching",
  } as any).returning();

  const frieren = insertedMedia.find(m => m.title === "Frieren: Beyond Journey's End");

  if (shogun && frieren) {
    await db.insert(logs).values([
      {
        mediaId: shogun.id,
        date: new Date().toISOString(),
        action: "watched_episode",
        progress: 3,
        notes: "S1 E3",
      },
      {
        mediaId: frieren.id,
        date: new Date().toISOString(),
        action: "watched_episode",
        progress: 24,
        notes: "Ep 24",
      }
    ]);
  }

  console.log("Seeding completed!");
}

seed().catch(console.error);
