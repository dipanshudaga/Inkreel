import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
import Link from "next/link";

interface ReadDiaryProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ReadDiary({ searchParams }: ReadDiaryProps) {
  const { filter = "all" } = await searchParams;

  const conditions = [
    or(eq(media.type, "book"), eq(media.type, "manga"))
  ];

  if (filter === "read") {
    conditions.push(eq(media.status, "completed"));
  } else if (filter === "watchlist") {
    conditions.push(eq(media.status, "plan_to_read"));
  } else if (filter === "love") {
    conditions.push(eq(media.status, "love"));
  }

  const readItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: [desc(media.completedAt), desc(media.updatedAt)],
  });

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col pt-8 pb-6 gap-6 border-b border-[#1A1A1A] px-8">
          <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-4xl m-0">
            Read Diary
          </h1>
        </div>

        {/* Grid */}
        <div className="flex flex-wrap gap-x-8 gap-y-10 p-8 overflow-y-auto">
          {readItems.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="w-35 flex flex-col gap-3 group">
              <div className="w-35 h-52.5 overflow-hidden bg-traced-surface border border-[#1A1A1A] relative">
                {item.posterUrl ? (
                  <div
                    className="bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 size-full cursor-pointer"
                    style={{ backgroundImage: `url(${item.posterUrl})` }}
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest">
                    No Cover
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 text-left">
                <div className="text-[16px] leading-tight text-traced-dark font-serif font-medium line-clamp-2 group-hover:text-traced-accent transition-colors">
                  {item.title}
                </div>
                <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px]">
                  {item.releaseYear || item.year || ""}
                </div>
              </div>
            </Link>
          ))}

          {readItems.length === 0 && (
            <div className="w-full py-20 text-center flex flex-col items-center gap-4">
              <p className="text-[#A1A19A] font-serif italic text-xl">Your read diary is empty.</p>
              <p className="text-[#737373] font-sans text-xs uppercase tracking-widest">Search for a book to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
