import Papa from "papaparse";
import { ImportItem } from "./types";

export async function parseGoodreadsCsv(file: File): Promise<ImportItem[]> {
  const content = await file.text();
  const parsed = Papa.parse(content, { 
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  }).data;

  return parsed.map((row: any) => {
    const title = row.Title;
    if (!title) return null;

    let status = "completed";
    const shelves = row.Shelves || row.Bookshelves || "";
    if (shelves.includes("to-read") || shelves.includes("want-to-read")) {
      status = "shelf";
    }

    const year = row["Year Published"] || row["Original Publication Year"] || "";
    let isbn = (row.ISBN || row.ISBN13 || "").replace(/[^0-9X]/gi, "");
    
    // Pad ISBN-10 if leading zero was stripped by spreadsheet software
    if (isbn.length === 9) {
      isbn = "0" + isbn;
    }
    
    const bookId = row["Book Id"] || isbn || `csv-${Math.random().toString(36).substring(7)}`;

    return {
      title: title,
      creator: row.Author || "",
      category: "read",
      status: status,
      year: year,
      isbn: isbn,
      externalId: `gb-import-${bookId}`
    };
  }).filter(Boolean) as ImportItem[];
}
