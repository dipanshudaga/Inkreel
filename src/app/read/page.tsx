import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";

export default async function ReadDiary() {
  // Fetch books and manga
  const readItems = await db.query.media.findMany({
    where: or(
      eq(media.type, "book"),
      eq(media.type, "manga")
    ),
    orderBy: [desc(media.completedAt), desc(media.updatedAt)],
  });

  // Fetch active items (reading)
  const activeItems = await db.query.media.findMany({
    where: and(
      or(eq(media.status, "reading"), eq(media.status, "consuming")),
      or(eq(media.type, "book"), eq(media.type, "manga"))
    ),
    with: {
      logs: {
        orderBy: [desc(logs.date)],
        limit: 1,
      },
    },
  });

  const totalLogged = readItems.filter(i => i.status === 'completed').length;
  const thisYear = readItems.filter(i => i.status === 'completed' && (i.completedAt?.startsWith('2026') || false)).length;

  return (
    <div className="flex min-h-screen">
      {/* Main Grid Section */}
      <div className="flex-1 flex flex-col border-r border-[#1A1A1A]">
        <div className="flex flex-col pt-8 pb-4 gap-6 border-b border-[#1A1A1A] px-8">
          <div className="flex justify-between items-end">
            <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-4xl m-0">
              Read Diary
            </h1>
            <div className="flex gap-4">
              <div className="inline-block border-b border-[#1A1A1A] cursor-pointer">
                <span className="tracking-[0.05em] uppercase text-traced-dark font-sans text-[13px] font-medium">
                  Grid
                </span>
              </div>
              <div className="inline-block cursor-pointer">
                <span className="tracking-[0.05em] uppercase text-[#737373] font-sans text-[13px]">
                  List
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <FilterButton label="All Media" active />
            <FilterButton label="Books" />
            <FilterButton label="Manga" />
            <FilterButton label="Articles" />
          </div>
        </div>

        <div className="py-4 px-8 bg-traced-bg border-b border-[#1A1A1A]">
          <h2 className="text-traced-dark font-serif font-medium italic text-2xl m-0">
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
              <div className="flex flex-col gap-1">
                <div className="text-[16px] leading-tight text-traced-dark font-serif font-medium line-clamp-2 group-hover:text-traced-accent transition-colors">
                  {item.title}
                </div>
                <div className="flex justify-between items-center">
                  <div className="uppercase tracking-[0.05em] text-traced-accent font-sans text-[11px] font-semibold">
                    {item.rating ? "★".repeat(Math.floor(item.rating)) + (item.rating % 1 !== 0 ? "½" : "") : ""}
                  </div>
                  <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px]">
                    {item.completedAt ? format(new Date(item.completedAt), "MMM d") : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* The Shelf Section */}
      <div className="w-108 flex flex-col shrink-0 antialiased bg-traced-bg">
        <div className="flex flex-col py-8 px-6 gap-12 sticky top-0">
          {/* Archive Stats */}
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-[#1A1A1A]">
              <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px]">
                The Archive
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-[32px] leading-none text-traced-dark font-serif font-medium">
                  {totalLogged.toLocaleString()}
                </div>
                <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px]">
                  Total Logged
                </div>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <div className="text-[32px] leading-none text-traced-dark font-serif font-medium">
                  {thisYear}
                </div>
                <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px]">
                  This Year
                </div>
              </div>
            </div>
          </div>

          {/* Active Signals */}
          <div className="flex flex-col gap-4">
            <div className="pb-2 border-b border-[#1A1A1A]">
              <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px]">
                Active Signals
              </span>
            </div>
            
            {activeItems.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="flex gap-4 bg-white border border-[#1A1A1A] p-3 hover:bg-traced-surface transition-colors cursor-pointer group text-left">
                <div className="w-15 h-22.5 shrink-0 overflow-hidden bg-traced-surface border border-[#1A1A1A]">
                  <div 
                    className="bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 size-full" 
                    style={{ backgroundImage: `url(${item.posterUrl})` }} 
                  />
                </div>
                <div className="flex flex-col justify-between py-0.5">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="uppercase tracking-[0.05em] text-traced-accent font-sans text-[11px] font-semibold text-left">
                      Reading
                    </div>
                    <div className="text-[18px] leading-tight text-traced-dark font-serif font-medium line-clamp-1 group-hover:text-traced-accent transition-colors text-left">
                      {item.title}
                    </div>
                  </div>
                  <div className="text-[#737373] font-sans text-xs uppercase tracking-wider text-left">
                    {item.logs?.[0]?.notes || "In Progress"}
                  </div>
                </div>
              </Link>
            ))}

            {activeItems.length === 0 && (
              <div className="py-4 text-center border border-[#1A1A1A] border-dashed text-[#737373] font-sans text-xs uppercase tracking-[0.05em]">
                No active signals
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`inline-block py-1.5 px-3 border border-[#1A1A1A] cursor-pointer transition-colors ${active ? 'bg-traced-surface' : 'hover:bg-traced-surface/50'}`}>
      <span className={`tracking-[0.05em] uppercase font-sans text-[13px] ${active ? 'text-traced-dark font-medium' : 'text-[#737373]'}`}>
        {label}
      </span>
    </div>
  );
}
