import { db } from "./index";
import { media, logs, users } from "./schema";

async function seed() {
  console.log("Seeding database (Postgres)...");
  
  // Clear existing data
  await db.delete(logs);
  await db.delete(media);
  await db.delete(users);

  // Create a default user
  const [user] = await db.insert(users).values({
    username: "demo",
    name: "Demo User",
    passwordHash: "demo", // Not used for actual login in seed
  }).returning();

  const sampleMedia = [
    {
      userId: user.id,
      externalId: "tmdb_m_1",
      type: "movie",
      title: "Dune: Part Two",
      releaseYear: 2024,
      creator: "Denis Villeneuve",
      posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqq9TrU.jpg",
      runtime: 166,
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
      status: "completed",
    },
    {
      userId: user.id,
      externalId: "ol_b_1",
      type: "book",
      title: "The Three-Body Problem",
      releaseYear: 2008,
      creator: "Liu Cixin",
      posterUrl: "https://covers.openlibrary.org/b/id/12836267-L.jpg",
      status: "completed",
    },
    {
      userId: user.id,
      externalId: "ani_a_1",
      type: "anime",
      title: "Frieren: Beyond Journey's End",
      releaseYear: 2023,
      creator: "Keiichiro Saito",
      posterUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-5z2n2Z2Z2z2Z.jpg",
      status: "watching",
    }
  ];

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
    userId: user.id,
    externalId: "tmdb_tv_1",
    type: "tv",
    title: "Shōgun",
    releaseYear: 2024,
    creator: "Justin Marks",
    posterUrl: "https://image.tmdb.org/t/p/w500/7WZZ12VA2BKT4T8SRATPRF69KH.jpg",
    status: "watching",
    category: "watch"
  } as any).returning();

  const frieren = insertedMedia.find(m => m.title === "Frieren: Beyond Journey's End");

  if (shogun && frieren) {
    await db.insert(logs).values([
      {
        userId: user.id,
        mediaId: shogun.id,
        date: new Date().toISOString(),
        action: "watched_episode",
        progress: 3,
        notes: "S1 E3",
      },
      {
        userId: user.id,
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
