import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { X } from "lucide-react";
import { ActionBar } from "@/components/item/action-bar";
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
          {/* Header Section — relative so X can be absolute */}
          <div className="relative py-12 px-16 border-b-hairline">
            <div className="flex flex-col gap-6 max-w-xl pr-16">
              <h1 className="tracking-[-0.02em] text-traced-dark font-serif font-medium text-4xl leading-tight">
                {item.title}
              </h1>
              <div className="flex items-center gap-4 text-[#737373] font-sans text-sm font-medium uppercase tracking-[0.05em]">
                <span>{item.releaseYear || item.year || "Unknown Year"}</span>
                <span className="text-[#D4D4D4]">•</span>
                <span>{item.creator || "Unknown Creator"}</span>
                {item.runtime && (
                  <>
                    <span className="text-[#D4D4D4]">•</span>
                    <span>{item.runtime} MIN</span>
                  </>
                )}
              </div>
            </div>

            {/* Close / Back button — absolute top-right */}
            <Link
              href="javascript:history.back()"
              className="absolute top-8 right-8 size-9 flex items-center justify-center border-hairline bg-white hover:bg-traced-dark hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={2} />
            </Link>
          </div>
          
          {/* Details Sections */}
          <div className="flex flex-col grow">
             {/* Action Bar — moved to top, interactive */}
             <ActionBar
               initialStatus={item.status}
               initialRating={item.rating}
               mediaId={item.id}
               isExternal={isExternal}
             />

             {/* Synopsis */}
             <div className="py-12 px-16 border-b-hairline flex flex-col gap-6">
               <h3 className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans font-bold text-[11px]">
                 Synopsis
               </h3>
               <p className="text-traced-dark font-serif text-xl leading-relaxed max-w-2xl">
                 {item.description || "No synopsis available for this title."}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
