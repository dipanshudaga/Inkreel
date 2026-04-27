import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
import Link from "next/link";

interface WatchDiaryProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function WatchDiary({ searchParams }: WatchDiaryProps) {
  const { filter = "all" } = await searchParams;

  const conditions: any[] = [
    or(eq(media.type, "movie"), eq(media.type, "anime"), eq(media.type, "tv"))
  ];

  if (filter === "watched") {
    conditions.push(eq(media.status, "completed"));
  } else if (filter === "watchlist") {
    conditions.push(eq(media.status, "plan_to_watch"));
  } else if (filter === "love") {
    conditions.push(eq(media.status, "love"));
  }

  const watchItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: [desc(media.completedAt), desc(media.updatedAt)],
  });

  // Group by year
  const byYear = watchItems.reduce<Record<string, typeof watchItems>>((acc, item) => {
    const year = item.releaseYear || item.year || "Unknown";
    const key = String(year);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedYears = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  const filters = [
    { label: "All", value: "all" },
    { label: "Watched", value: "watched" },
    { label: "Watchlist", value: "watchlist" },
    { label: "Love", value: "love" },
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col pt-8 pb-6 gap-6 border-b border-[#1A1A1A] px-8">
          <div className="flex justify-between items-end">
            <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-4xl m-0">
              Watch Diary
            </h1>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-3">
            {filters.map((f) => (
              <Link
                key={f.value}
                href={`/watch?filter=${f.value}`}
                className={`inline-block py-1.5 px-4 border border-[#1A1A1A] text-[12px] font-sans font-semibold uppercase tracking-widest transition-colors ${
                  filter === f.value ? "bg-traced-dark text-white" : "text-[#737373] hover:bg-black/5"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Items grouped by year */}
        <div className="flex flex-col overflow-y-auto">
          {watchItems.length === 0 && (
            <div className="w-full py-32 text-center flex flex-col items-center gap-4 px-8">
              <p className="text-[#A1A19A] font-serif italic text-2xl">Your watch diary is empty.</p>
              <p className="text-[#737373] font-sans text-xs uppercase tracking-widest">Use search to find a movie or show and add it.</p>
            </div>
          )}

          {sortedYears.map((year) => {
            const items = byYear[year];
            return (
              <div key={year}>
                {/* Year header */}
                <div className="flex items-baseline gap-4 py-4 px-8 border-b border-[#1A1A1A] bg-traced-bg">
                  <h2 className="text-traced-dark font-serif font-medium italic text-2xl m-0">{year}</h2>
                  <span className="text-[#737373] font-sans text-[11px] uppercase tracking-widest font-semibold">{items.length} {items.length === 1 ? "title" : "titles"}</span>
                </div>
                {/* Grid */}
                <div className="flex flex-wrap gap-x-8 gap-y-10 p-8">
                  {items.map((item) => (
                    <Link key={item.id} href={`/items/${item.id}`} className="w-35 flex flex-col gap-3 group">
                      <div className="w-35 h-52.5 overflow-hidden bg-traced-surface border border-[#1A1A1A] relative">
                        {item.posterUrl ? (
                          <div
                            className="bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 size-full cursor-pointer"
                            style={{ backgroundImage: `url(${item.posterUrl})` }}
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest">
                            No Poster
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
