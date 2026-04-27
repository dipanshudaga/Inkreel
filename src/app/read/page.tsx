import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, or, and, desc, gte } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";

interface ReadDiaryProps {
  searchParams: Promise<{ filter?: string; view?: string }>;
}

export default async function ReadDiary({ searchParams }: ReadDiaryProps) {
  const { filter = "all", view = "grid" } = await searchParams;

  // Build filter conditions
  const conditions = [
    or(eq(media.type, "book"), eq(media.type, "manga"))
  ];

  if (filter === "read") {
    conditions.push(eq(media.status, "completed"));
  } else if (filter === "watchlist") {
    conditions.push(eq(media.status, "plan_to_watch"));
  } else if (filter === "love") {
    conditions.push(gte(media.rating, 4.5));
  }

  const readItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: [desc(media.completedAt), desc(media.updatedAt)],
  });

  return (
    <div className="flex min-h-screen">
      {/* Main Grid Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col pt-8 pb-4 gap-6 border-b border-[#1A1A1A] px-8">
          <div className="flex justify-between items-end">
            <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-4xl m-0">
              Read Diary
            </h1>
            <div className="flex gap-4">
              <Link 
                href="/read?view=grid" 
                className={`inline-block border-b ${view === 'grid' ? 'border-[#1A1A1A]' : 'border-transparent'} cursor-pointer`}
              >
                <span className={`tracking-[0.05em] uppercase font-sans text-[13px] font-medium ${view === 'grid' ? 'text-traced-dark' : 'text-[#737373]'}`}>
                  Grid
                </span>
              </Link>
              <Link 
                href="/read?view=list" 
                className={`inline-block border-b ${view === 'list' ? 'border-[#1A1A1A]' : 'border-transparent'} cursor-pointer`}
              >
                <span className={`tracking-[0.05em] uppercase font-sans text-[13px] ${view === 'list' ? 'text-traced-dark font-medium' : 'text-[#737373]'}`}>
                  List
                </span>
              </Link>
            </div>
          </div>
          
          <div className="flex gap-4">
            <FilterButton label="All" active={filter === "all"} href="/read?filter=all" />
            <FilterButton label="Read" active={filter === "read"} href="/read?filter=read" />
            <FilterButton label="Watchlist" active={filter === "watchlist"} href="/read?filter=watchlist" />
            <FilterButton label="Love" active={filter === "love"} href="/read?filter=love" />
          </div>
        </div>

        <div className="py-4 px-8 bg-traced-bg border-b border-[#1A1A1A]">
          <h2 className="text-traced-dark font-serif font-medium italic text-2xl m-0 text-left">
            2026
          </h2>
        </div>

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
                <div className="flex justify-between items-center">
                  <div className="uppercase tracking-[0.05em] text-traced-accent font-sans text-[11px] font-semibold">
                    {item.rating ? "★".repeat(Math.floor(item.rating)) + (item.rating % 1 !== 0 ? "½" : "") : ""}
                  </div>
                  <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px]">
                    {(() => {
                      try {
                        return item.completedAt ? format(new Date(item.completedAt), "MMM d") : "";
                      } catch (e) {
                        return "";
                      }
                    })()}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {readItems.length === 0 && (
            <div className="w-full py-20 text-center flex flex-col items-center gap-4">
              <p className="text-[#A1A19A] font-serif italic text-xl">No results found for this filter.</p>
              <Link href="/read" className="text-traced-accent font-sans text-xs uppercase tracking-widest border-b border-traced-accent/30 hover:border-traced-accent transition-all">Clear Filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active = false, href }: { label: string; active?: boolean; href: string }) {
  return (
    <Link 
      href={href}
      className={`inline-block py-1.5 px-3 border border-[#1A1A1A] cursor-pointer transition-colors ${active ? 'bg-traced-surface' : 'hover:bg-traced-surface/50'}`}
    >
      <span className={`tracking-[0.05em] uppercase font-sans text-[13px] ${active ? 'text-traced-dark font-medium' : 'text-[#737373]'}`}>
        {label}
      </span>
    </Link>
  );
}
