import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export default async function Home() {
  const selection = await db.query.media.findMany({
    orderBy: [desc(media.updatedAt)],
    limit: 10,
  });

  return (
    <div className="grow flex flex-col py-16 px-20 min-h-screen bg-traced-bg">
      <div className="mb-20">
        <h1 className="text-[72px] leading-[1.1] tracking-[-0.03em] text-traced-dark font-serif font-medium italic m-0">
          {getGreeting()}
        </h1>
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-12 bg-traced-accent" />
          <p className="tracking-[0.1em] uppercase text-[#737373] font-sans text-xs font-semibold">
            Here is a selection from your archive.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-12 gap-y-16">
        {selection.map((item) => (
          <Link 
            key={item.id} 
            href={`/items/${item.id}`}
            className="flex flex-col gap-6 group"
          >
            <div className="w-full aspect-[2/3] overflow-hidden border-hairline bg-traced-surface relative shadow-sm group-hover:shadow-xl transition-all duration-700">
              {item.posterUrl ? (
                <div 
                  className="bg-cover bg-center grayscale w-full h-full group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                  style={{ backgroundImage: `url(${item.posterUrl})` }} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest">
                  No Cover
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-traced-dark font-serif font-medium text-2xl leading-tight line-clamp-2 group-hover:text-traced-accent transition-colors duration-300">
                {item.title}
              </div>
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.1em] text-[#737373] font-sans text-[11px] font-bold">
                  {item.type}
                </span>
                <span className="text-[#D4D4D4]">•</span>
                <span className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans text-[11px]">
                  {item.releaseYear}
                </span>
              </div>
            </div>
          </Link>
        ))}

        {selection.length === 0 && (
          <div className="col-span-full py-32 border-hairline border-dashed flex flex-col items-center justify-center gap-6 bg-white/50">
             <span className="text-[#737373] font-sans text-sm uppercase tracking-widest">Your archive is empty</span>
             <Link href="/watch" className="px-8 h-12 bg-traced-dark text-white font-sans text-[11px] uppercase tracking-widest font-semibold flex items-center hover:bg-black transition-colors">
               Start Exploring
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

