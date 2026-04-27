import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or, and, desc, asc, like, gte, lte } from "drizzle-orm";
import { FilterBar } from "@/components/item/filter-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ReadDiaryProps {
  searchParams: Promise<{ 
    filter?: string; 
    type?: string; 
    genre?: string;
    decade?: string;
    sort?: string;
  }>;
}

export default async function ReadDiary({ searchParams }: ReadDiaryProps) {
  const { 
    filter = "all", 
    type = "all", 
    genre = "all",
    decade = "all",
    sort = "logged_desc" 
  } = await searchParams;

  const conditions: any[] = [];
  
  // Base category filter
  conditions.push(or(eq(media.type, "book"), eq(media.type, "manga")));

  // Type filter
  if (type !== "all") {
    conditions.push(eq(media.type, type));
  }

  // Category filter
  if (filter === "read") {
    conditions.push(eq(media.status, "completed"));
  } else if (filter === "watchlist") {
    conditions.push(eq(media.status, "plan_to_read"));
  } else if (filter === "love") {
    conditions.push(eq(media.status, "love"));
  }

  // Genre filter
  if (genre !== "all") {
    conditions.push(like(media.genres, `%${genre}%`));
  }

  // Decade filter
  if (decade !== "all") {
    const startYear = parseInt(decade);
    conditions.push(gte(media.releaseYear, startYear));
    conditions.push(lte(media.releaseYear, startYear + 9));
  }

  // Sorting
  let orderBy: any = desc(media.completedAt);
  if (sort === "logged_asc") orderBy = asc(media.completedAt);
  else if (sort === "release_desc") orderBy = desc(media.releaseYear);
  else if (sort === "release_asc") orderBy = asc(media.releaseYear);
  else if (sort === "rating_desc") orderBy = desc(media.rating);
  else if (sort === "title_asc") orderBy = asc(media.title);

  const readItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: [orderBy, desc(media.updatedAt)],
  });

  // Fetch all user's genres and decades for filter options
  const allUserMedia = await db.query.media.findMany({
    where: or(eq(media.type, "book"), eq(media.type, "manga")),
    columns: { genres: true, releaseYear: true }
  });

  const uniqueGenres = [...new Set(allUserMedia.flatMap(m => m.genres?.split(',').map(g => g.trim()) || []))].filter(Boolean).sort();
  const uniqueYears = [...new Set(allUserMedia.map(m => m.releaseYear).filter(Boolean) as number[])].sort((a, b) => b - a);
  const uniqueDecades = [...new Set(uniqueYears.map(y => Math.floor(y / 10) * 10))].map(d => `${d}s`);

  // Group by logged year
  const byLoggedYear = readItems.reduce<Record<string, typeof readItems>>((acc, item) => {
    let year = "No Date";
    if (item.completedAt) {
      try {
        year = new Date(item.completedAt).getFullYear().toString();
      } catch (e) {
        year = "Unknown";
      }
    } else if (item.status === 'plan_to_read') {
      year = "Reading List";
    }
    
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const sortedYearKeys = Object.keys(byLoggedYear).sort((a, b) => {
    if (a === "Reading List") return 1;
    if (b === "Reading List") return -1;
    if (a === "No Date" || a === "Unknown") return 1;
    if (b === "No Date" || b === "Unknown") return -1;
    return Number(b) - Number(a);
  });

  return (
    <div className="flex min-h-screen bg-traced-bg">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col pt-12 pb-2 gap-8 px-8 border-b-hairline">
          <h1 className="tracking-[-0.04em] text-traced-dark font-serif font-medium text-5xl m-0 italic">
            Read Diary
          </h1>
          
          <FilterBar 
            genres={uniqueGenres}
            decades={uniqueDecades}
            currentFilters={{ filter, type, genre, decade, sort }}
          />
        </div>

        {/* Items grouped by year */}
        <div className="flex flex-col overflow-y-auto">
          {readItems.length === 0 && (
            <div className="w-full py-32 text-center flex flex-col items-center gap-4 px-8">
              <p className="text-[#A1A19A] font-serif italic text-3xl">Your archive is quiet.</p>
              <p className="text-[#737373] font-sans text-xs uppercase tracking-widest font-semibold">No titles match these search criteria.</p>
            </div>
          )}

          {sortedYearKeys.map((year) => {
            const items = byLoggedYear[year];
            return (
              <div key={year} className="flex flex-col">
                {/* Year header */}
                <div className="flex items-baseline gap-2 py-6 px-8 border-b border-[#1A1A1A] bg-traced-bg sticky top-0 z-20">
                  <h2 className="text-traced-dark font-serif font-medium italic text-3xl m-0">{year}</h2>
                  <span className="text-traced-accent font-serif italic text-xl font-medium">({items.length})</span>
                </div>
                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 p-10 bg-white">
                  {items.map((item) => (
                    <Link key={item.id} href={`/items/${item.id}`} className="flex flex-col gap-4 group">
                      <div className="aspect-[2/3] overflow-hidden bg-traced-surface border-hairline relative">
                        {item.posterUrl ? (
                          <div
                            className="bg-cover bg-center transition-all duration-700 size-full group-hover:scale-105"
                            style={{ backgroundImage: `url(${item.posterUrl})` }}
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest font-bold">
                            No Cover
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                      </div>
                      <div className="flex flex-col gap-1.5 text-left">
                        <div className="text-[17px] leading-tight text-traced-dark font-serif font-medium line-clamp-2 group-hover:text-traced-accent transition-colors duration-300">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans text-[10px] font-bold">
                            {item.releaseYear || item.year || ""}
                          </span>
                          {item.rating && (
                            <>
                              <span className="text-[#D4D4D4]">•</span>
                              <span className="text-traced-accent font-sans text-[10px] font-bold">★ {item.rating}</span>
                            </>
                          )}
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
