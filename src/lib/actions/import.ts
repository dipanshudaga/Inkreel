"use server";

import { db } from "@/lib/db";
import { media, trackingEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ImportRow {
  title: string;
  category: "watch" | "read" | "play";
  rating?: number;
  status?: string;
  year?: number;
}

export async function importCsvAction(csvData: string) {
  try {
    // Basic CSV parser (handles simple quoted strings)
    const rows = csvData.split("\n").map(line => {
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return parts.map(p => p.trim().replace(/^"|"$/g, ""));
    });

    const header = rows[0];
    const data = rows.slice(1);

    const titleIdx = header.findIndex(h => h.toLowerCase().includes("title"));
    const catIdx = header.findIndex(h => h.toLowerCase().includes("category") || h.toLowerCase().includes("type"));
    const ratingIdx = header.findIndex(h => h.toLowerCase().includes("rating"));
    const statusIdx = header.findIndex(h => h.toLowerCase().includes("status"));
    const yearIdx = header.findIndex(h => h.toLowerCase().includes("year"));

    if (titleIdx === -1) {
      return { success: false, error: "CSV must contain a 'title' column" };
    }

    const importedCount = 0;

    for (const row of data) {
      if (!row[titleIdx]) continue;

      const title = row[titleIdx];
      const category = (row[catIdx]?.toLowerCase() || "watch") as "watch" | "read" | "play";
      const rating = row[ratingIdx] ? parseFloat(row[ratingIdx]) : 0;
      const status = row[statusIdx] || "completed";
      const year = row[yearIdx] ? parseInt(row[yearIdx]) : null;

      // Check if media exists by slug
      const slug = `${category}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      
      let mediaId: string;
      const existingMedia = await db.query.media.findFirst({
        where: eq(media.slug, slug),
      });

      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        const [newMedia] = await db.insert(media).values({
          title,
          category,
          slug,
          year,
          posterUrl: "", // UI can trigger "match" later
        }).returning();
        mediaId = newMedia.id;
      }

      // Add tracking entry
      await db.insert(trackingEntries).values({
        mediaId,
        status,
        rating,
        isLiked: rating >= 4, // Auto-like high ratings
      });
    }

    return { success: true, count: data.length };
  } catch (error) {
    console.error("Import Action Error:", error);
    return { success: false, error: "Failed to process CSV" };
  }
}
