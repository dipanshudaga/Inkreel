export interface ImportItem {
  title: string;
  year: string;
  category: "watch" | "read";
  status: string;
  externalId: string;
  posterUrl?: string;
  matchedId?: string;
  creator?: string;
  isbn?: string;
  matched?: boolean;
  isDocumentary?: boolean;
  type?: string;
}
