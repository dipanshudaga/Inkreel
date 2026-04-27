import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { ActionBar } from "@/components/item/action-bar";
import { notFound } from "next/navigation";
import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

interface ItemPageProps {
  params: {
    id: string;
  };
}

async function enrichItem(item: any) {
  if (!item.externalId) return item;

  try {
    let freshData = null;
    const id = item.externalId;

    if (id.startsWith("tmdb-movie-")) {
      freshData = await getMovieById(id.replace("tmdb-movie-", ""));
    } else if (id.startsWith("tmdb-tv-")) {
      freshData = await getTVById(id.replace("tmdb-tv-", ""));
    } else if (id.startsWith("gb-")) {
      freshData = await getBookById(id.replace("gb-", ""));
    } else if (id.startsWith("anilist-")) {
      freshData = await getAniListById(parseInt(id.replace("anilist-", ""), 10));
    }

    if (freshData) {
      return {
        ...item,
        description: freshData.description || item.description,
        creator: freshData.creator !== "Unknown Director" && freshData.creator !== "Movie" && freshData.creator !== "TV Series" ? freshData.creator : item.creator,
        genres: freshData.genres?.length > 0 ? freshData.genres : item.genres,
        runtime: freshData.runtime || item.runtime,
        backdropUrl: freshData.backdropUrl || item.backdropUrl,
        cast: (freshData as any).cast || [],
      };
    }
  } catch (error) {
    console.error("Enrichment failed:", error);
  }
  return item;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  
  let item: any = null;
  let isExternal = false;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUUID) {
    const localItem = await db.query.media.findFirst({
      where: eq(media.id, id),
      with: {
        logs: {
          orderBy: [desc(logs.date)],
        },
      },
    });
    if (localItem) {
      item = await enrichItem(localItem);
    }
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

  const genresArray = Array.isArray(item.genres) ? item.genres : (item.genres?.split(", ") || []);
  const displayCreator = item.creator && !item.creator.toLowerCase().includes("unknown") && item.creator !== "Movie" && item.creator !== "TV Series";

  return (
    <div className="flex flex-col min-h-screen bg-traced-bg text-traced-dark selection:bg-traced-accent selection:text-white">
      {/* 1. Header Navigation */}
      <nav className="flex items-center justify-between px-16 py-8">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-traced-gray hover:text-traced-dark transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Archive
        </Link>
        <div className="flex items-center gap-6">
           <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-traced-gray">
             {item.type === 'anime' ? 'ANIME' : item.type === 'tv' ? 'TV SHOW' : item.type === 'manga' ? 'MANGA' : item.type.toUpperCase()}
           </span>
        </div>
      </nav>

      {/* 2. Main Layout Container */}
      <main className="flex-1 px-16 pb-32">
        <div className="max-w-6xl mx-auto">
          
          {/* 3. Mandatory Action Bar at the Top */}
          <div className="mb-12 py-8 border-y border-[#1A1A1A] bg-white/30">
            <div className="max-w-xl">
              <ActionBar
                initialStatus={item.status}
                initialRating={item.rating}
                mediaId={item.id}
                isExternal={isExternal}
              />
            </div>
          </div>

          {/* 4. Title Section */}
          <header className="mb-20">
            <h1 className="text-7xl md:text-8xl font-serif font-medium tracking-tight leading-[1.0] max-w-5xl mb-12">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap items-end gap-12 border-t border-[#1A1A1A] pt-8">
              {displayCreator && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-traced-gray">Director/Author</span>
                  <span className="text-lg font-medium tracking-tight leading-none">{item.creator}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-traced-gray">Release</span>
                <span className="text-lg font-medium tracking-tight leading-none italic text-[#737373]">{item.releaseYear || item.year || "N/A"}</span>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                <span className="text-[10px] uppercase tracking-widest font-bold text-traced-gray">Genres</span>
                <div className="flex flex-wrap gap-1.5">
                  {genresArray.filter((g: string) => g).map((genre: string) => (
                    <span key={genre} className="text-[10px] font-bold border border-[#1A1A1A] px-2 py-0.5 uppercase tracking-tight bg-white">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-20">
            {/* 5. Left Column: Poster */}
            <aside>
              <div className="sticky top-12">
                <div className="w-full aspect-[2/3] border border-[#1A1A1A] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] bg-traced-surface relative group overflow-hidden">
                  {item.posterUrl ? (
                    <img 
                      src={item.posterUrl} 
                      alt={item.title} 
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-traced-gray uppercase tracking-widest text-[10px]">No Poster</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </aside>

            {/* 6. Right Column: Content */}
            <article className="flex flex-col gap-24">
              {/* Synopsis Section */}
              <section className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-[#1A1A1A] w-8" />
                  <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-traced-gray">Synopsis</h2>
                </div>
                <div className="max-w-2xl">
                  <p className="text-lg md:text-xl font-sans leading-relaxed text-traced-dark/80 text-justify">
                    {item.description || "In the vast expanse of the archive, this particular narrative remains partially veiled."}
                  </p>
                </div>
              </section>

              {/* Logs Section */}
              {item.logs && item.logs.length > 0 && (
                <section className="flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-[#1A1A1A] w-8" />
                    <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-traced-gray">Log History</h2>
                  </div>
                  <div className="flex flex-col divide-y divide-[#E5E5E5] border-t border-b border-[#E5E5E5]">
                    {item.logs.map((log: any) => (
                      <div key={log.id} className="grid grid-cols-[1fr_auto] py-5 gap-8 items-start">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-serif italic text-traced-dark">
                            {log.notes || "Logged in the archive."}
                          </span>
                          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-traced-gray">
                            {format(new Date(log.date), "MMMM d, yyyy")}
                          </span>
                        </div>
                        {log.rating && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                            <Star size={9} fill="white" />
                            {log.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Technical Footnote */}
              <section className="flex flex-wrap gap-x-12 gap-y-6 pt-12 border-t border-[#1A1A1A] opacity-40">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] uppercase tracking-widest font-bold">Entry ID</span>
                   <span className="text-[9px] font-mono break-all">{item.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] uppercase tracking-widest font-bold">Source</span>
                   <span className="text-[9px] font-mono uppercase">{item.externalId?.split('-')[0] || 'Local'}</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] uppercase tracking-widest font-bold">Category</span>
                   <span className="text-[9px] font-mono uppercase">{item.category}</span>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
