import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Star, ArrowLeft, Plus } from "lucide-react";
import { notFound } from "next/navigation";

interface ItemPageProps {
  params: {
    id: string;
  };
}

import { LogButton } from "@/components/item/log-button";
import { AddToArchiveButton } from "@/components/item/add-to-archive-button";

import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  
  let item: any = null;
  let isExternal = false;

  // UUID regex — only query DB if it looks like a real UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // 1. Only query DB for UUID-shaped IDs to avoid Postgres crashing on prefixed external IDs
  if (isUUID) {
    item = await db.query.media.findFirst({
      where: eq(media.id, id),
      with: {
        logs: {
          orderBy: [desc(logs.date)],
        },
      },
    });
  }

  // 2. If not in DB (or not a UUID), check if it's a prefixed external ID
  if (!item) {
    if (id.startsWith("tmdb-movie-")) {
      item = await getMovieById(id.replace("tmdb-movie-", ""));
      isExternal = true;
    } else if (id.startsWith("tmdb-tv-")) {
      item = await getTVById(id.replace("tmdb-tv-", ""));
      isExternal = true;
    } else if (id.startsWith("gb-")) {
      item = await getBookById(id.replace("gb-", ""));
      isExternal = true;
    } else if (id.startsWith("anilist-")) {
      item = await getAniListById(parseInt(id.replace("anilist-", ""), 10));
      isExternal = true;
    }
  }

  if (!item) {
    notFound();
  }

  const latestLog = item.logs?.[0];

  return (
    <div className="flex flex-col min-h-screen bg-traced-bg">
      <div className="flex flex-1 border-b-hairline overflow-hidden">
        {/* Left Side: Visual Frame */}
        <div className="w-[576px] shrink-0 border-r-hairline flex items-center justify-center bg-[#FDFDFB] p-16">
          <div className="w-full aspect-[2/3] border-hairline shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] relative overflow-hidden bg-traced-surface">
             {item.posterUrl ? (
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="size-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
             ) : (
                <div className="size-full flex items-center justify-center text-traced-gray uppercase tracking-widest text-xs">
                  No Visual Available
                </div>
             )}
             {/* Glass Overlay for depth */}
             <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10" />
          </div>
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Section */}
          <div className="py-16 px-16 border-b-hairline flex justify-between items-start">
            <div className="flex flex-col gap-6 max-w-2xl">
              <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-7xl leading-[0.95]">
                {item.title}
              </h1>
              <div className="flex items-center gap-4 text-[#737373] font-sans text-sm font-medium uppercase tracking-[0.05em]">
                <span>{item.releaseYear || "Unknown Year"}</span>
                <span className="text-[#D4D4D4]">•</span>
                <span>{item.creator || "Unknown Creator"}</span>
                <span className="text-[#D4D4D4]">•</span>
                <span>{item.runtime ? `${item.runtime} MIN` : "Unknown Duration"}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="text-traced-accent font-serif font-medium text-5xl leading-none">
                {item.rating || "N/A"}
              </div>
              <div className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-semibold">
                Avg Rating
              </div>
            </div>
          </div>
          
          {/* Details Sections */}
          <div className="flex flex-col grow">
             {/* Synopsis */}
             <div className="py-12 px-16 border-b-hairline flex flex-col gap-6">
               <h3 className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans font-bold text-[11px]">
                 Synopsis
               </h3>
               <p className="text-traced-dark font-serif text-xl leading-relaxed max-w-2xl">
                 {item.description || "No synopsis available for this title."}
               </p>
             </div>

             {/* Letterboxd-style Action Bar */}
             <div className="py-12 px-16 border-b-hairline flex items-center gap-16">
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all ${item.status === 'completed' ? 'bg-traced-accent border-traced-accent text-white' : 'bg-white hover:border-traced-accent text-[#737373]'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Watched</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all ${item.status === 'plan_to_watch' ? 'bg-[#3B82F6] border-[#3B82F6] text-white' : 'bg-white hover:border-[#3B82F6] text-[#737373]'}`}>
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Watchlist</span>
                </div>

                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                  <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all ${item.rating >= 4.5 ? 'bg-[#EF4444] border-[#EF4444] text-white' : 'bg-white hover:border-[#EF4444] text-[#737373]'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={item.rating >= 4.5 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Love</span>
                </div>
             </div>

             {/* Recent Activity / Notes */}
             {!isExternal && (
               <div className="py-12 px-16 flex flex-col gap-8">
                 <h3 className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans font-bold text-[11px]">
                   Notes
                 </h3>
                 <div className="bg-white border-hairline p-10 max-w-2xl">
                    <p className="text-traced-dark font-serif text-2xl italic leading-relaxed">
                      {item.logs?.[0]?.notes || "No notes for this entry yet. Click to add a log."}
                    </p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
