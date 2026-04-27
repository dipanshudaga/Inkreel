import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { X } from "lucide-react";
import { ActionBar } from "@/components/item/action-bar";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { ProgressTracker } from "@/components/item/progress-tracker";

interface ItemPageProps {
  params: {
    id: string;
  };
}

import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  
  let item: any = null;
  let isExternal = false;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
  const genresArray = Array.isArray(item.genres) ? item.genres : (item.genres?.split(", ") || []);

  return (
    <div className="flex flex-col min-h-screen bg-traced-bg relative overflow-x-hidden">
      {/* 1. Backdrop Section */}
      <div className="h-[45vh] w-full relative overflow-hidden bg-[#0A0A0A]">
        {item.backdropUrl ? (
          <>
            <img 
              src={item.backdropUrl} 
              className="w-full h-full object-cover opacity-30 scale-105 blur-[1px]" 
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-traced-bg via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#121212] to-[#0A0A0A]" />
        )}
        
        {/* Navigation Over Backdrop */}
        <div className="absolute top-8 right-8 z-50">
          <BackButton />
        </div>
      </div>

      <div className="flex flex-1 px-16 -mt-32 relative z-10 gap-16 pb-32">
        {/* 2. Left Column: Poster */}
        <div className="w-[320px] shrink-0">
          <div className="w-full aspect-[2/3] border-hairline shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden bg-traced-surface">
             {item.posterUrl ? (
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="size-full object-cover"
                />
             ) : (
                <div className="size-full flex items-center justify-center text-traced-gray uppercase tracking-widest text-xs">
                  No Poster
                </div>
             )}
             <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5" />
          </div>
        </div>

        {/* 3. Right Column: Info */}
        <div className="flex-1 flex flex-col pt-32">
          {/* Header Info */}
          <div className="flex flex-col gap-2 max-w-4xl mb-12">
            <h1 className="tracking-[-0.03em] text-traced-dark font-serif font-medium text-7xl leading-[1.05] mb-4">
              {item.title}
            </h1>
            
            <div className="flex items-center gap-4 text-traced-dark font-sans text-xl font-medium tracking-tight">
              {item.creator && !item.creator.toLowerCase().includes("unknown") && (
                <>
                  <span>{item.creator}</span>
                  <span className="text-[#D4D4D4]">•</span>
                </>
              )}
              <span className="text-[#737373] font-light italic">{item.releaseYear || item.year || "Year N/A"}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-8">
              {genresArray.filter((g: string) => g && g !== "").map((genre: string) => (
                <span key={genre} className="px-3 py-1 border-hairline text-[10px] uppercase tracking-widest font-bold text-[#737373] bg-white">
                  {genre}
                </span>
              ))}
              {item.runtime && (
                <span className="px-3 py-1 border-hairline border-traced-dark text-[10px] uppercase tracking-widest font-bold text-traced-dark bg-white">
                  {item.runtime} {item.category === "read" ? "PAGES" : "MIN"}
                </span>
              )}
            </div>
          </div>

          {/* Core Controls */}
          <div className="max-w-xl mb-16">
            <ActionBar
              initialStatus={item.status}
              initialRating={item.rating}
              mediaId={item.id}
              isExternal={isExternal}
            />
          </div>

          {/* Main Content Layout */}
          <div className="max-w-3xl">
            {/* Synopsis */}
            <div className="flex flex-col gap-6">
              <h3 className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans font-bold text-[11px]">
                Synopsis
              </h3>
              <p className="text-traced-dark font-serif text-2xl leading-relaxed text-justify opacity-90">
                {item.description || "No description available for this title."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
