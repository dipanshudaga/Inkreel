import JSZip from "jszip";
import Papa from "papaparse";
import { ImportItem } from "./types";

export async function parseLetterboxdZip(file: File): Promise<ImportItem[]> {
  const zip = await JSZip.loadAsync(file);
  const itemMap = new Map<string, ImportItem>();

  // 1. Process Watched
  const watchedCsv = zip.file("watched.csv");
  if (watchedCsv) {
    const content = await watchedCsv.async("text");
    const parsed = Papa.parse(content, { header: true }).data;
    parsed.forEach((row: any) => {
      if (!row.Name) return;
      const key = `${row.Name}-${row.Year}`;
      itemMap.set(key, {
        title: row.Name,
        year: row.Year,
        category: "watch",
        status: "completed",
        externalId: row["Letterboxd URI"]
      });
    });
  }

  // 2. Process Likes (Upgrade existing or add new)
  const likesCsv = zip.file("likes/films.csv");
  if (likesCsv) {
    const content = await likesCsv.async("text");
    const parsed = Papa.parse(content, { header: true }).data;
    parsed.forEach((row: any) => {
      if (!row.Name) return;
      const key = `${row.Name}-${row.Year}`;
      const existing = itemMap.get(key);
      if (existing) {
        existing.status = "loved";
      } else {
        itemMap.set(key, {
          title: row.Name,
          year: row.Year,
          category: "watch",
          status: "loved",
          externalId: row["Letterboxd URI"]
        });
      }
    });
  }

  // 3. Process Watchlist (ONLY if not already watched)
  const watchlistCsv = zip.file("watchlist.csv");
  if (watchlistCsv) {
    const content = await watchlistCsv.async("text");
    const parsed = Papa.parse(content, { header: true }).data;
    parsed.forEach((row: any) => {
      if (!row.Name) return;
      const key = `${row.Name}-${row.Year}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          title: row.Name,
          year: row.Year,
          category: "watch",
          status: "watchlist",
          externalId: row["Letterboxd URI"]
        });
      }
    });
  }

  return Array.from(itemMap.values());
}
