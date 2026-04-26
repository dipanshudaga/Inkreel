"use server";

import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ImportRow {
  title: string;
  type: string;
  rating?: number;
  status?: string;
  releaseYear?: number;
}

export async function importCsvAction(csvData: string) {
  try {
    const rows = csvData.split("\n").map(line => {
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return parts.map(p => p.trim().replace(/^"|"$/g, ""));
    });

    const header = rows[0];
    const data = rows.slice(1);

    const titleIdx = header.findIndex(h => h.toLowerCase().includes("title"));
    const typeIdx = header.findIndex(h => h.toLowerCase().includes("category") || h.toLowerCase().includes("type"));
    const ratingIdx = header.findIndex(h => h.toLowerCase().includes("rating"));
    const statusIdx = header.findIndex(h => h.toLowerCase().includes("status"));
    const yearIdx = header.findIndex(h => h.toLowerCase().includes("year"));

    if (titleIdx === -1) {
      return { success: false, error: "CSV must contain a 'title' column" };
    }

    for (const row of data) {
      if (!row[titleIdx]) continue;

      const title = row[titleIdx];
      const type = row[typeIdx]?.toLowerCase() || "movie";
      const rating = row[ratingIdx] ? parseFloat(row[ratingIdx]) : 0;
      const status = row[statusIdx] || "completed";
      const releaseYear = row[yearIdx] ? parseInt(row[yearIdx]) : null;

      // Check if media exists
      const existingMedia = await db.query.media.findFirst({
        where: eq(media.title, title),
      });

      let mediaId: string;
      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        const [newMedia] = await db.insert(media).values({
          title,
          type,
          externalId: `manual_${Date.now()}`,
          releaseYear,
          status,
          rating,
        } as any).returning();
        mediaId = newMedia.id;
      }

      // Add log entry
      await db.insert(logs).values({
        mediaId,
        date: new Date().toISOString(),
        action: "finished",
        notes: "Imported from CSV",
      });
    }

    return { success: true, count: data.length };
  } catch (error) {
    console.error("Import Action Error:", error);
    return { success: false, error: "Failed to process CSV" };
  }
}
