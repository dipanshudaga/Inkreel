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
      {/* 1. Sticky Top Action Bar */}
      <nav className="sticky top-0 z-50 h-14 border-b border-black bg-traced-bg flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <Link 
            href={item.category === 'read' ? '/read' : '/watch'} 
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-traced-gray hover:text-traced-dark transition-colors"
          >
            Index / {item.category === 'read' ? 'Read' : 'Watch'} / {item.title}
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <ActionBar
            initialStatus={item.status}
            initialRating={item.rating}
            mediaId={item.id}
            isExternal={isExternal}
            variant="compact"
            item={item}
          />
        </div>
      </nav>

      <div className="flex flex-1">
        {/* 2. Main Content (Left Panel) */}
        <main className="flex-1 border-r border-hairline overflow-y-auto">
          {/* Hero Section */}
          <header className="p-10 lg:p-16 border-b border-hairline">
            <h1 className="text-5xl lg:text-7xl font-serif font-medium italic tracking-[-0.04em] leading-[0.85] m-0 mb-16">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap gap-16 mt-12">
              {displayCreator && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3]">Director/Author</span>
                  <span className="text-2xl font-serif italic">{item.creator}</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3]">Release Year</span>
                <span className="text-2xl font-serif italic">{item.releaseYear || item.year || "N/A"}</span>
              </div>
            </div>
          </header>

          {/* Synopsis Section */}
          <section className="p-10 lg:p-16 border-b border-hairline">
            <span className="block text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3A3A3] mb-8">Synopsis</span>
            <p className="text-2xl lg:text-3xl font-serif leading-[1.4] max-w-3xl">
              {item.description || "In the vast expanse of the archive, this particular narrative remains partially veiled."}
            </p>
          </section>

          {/* Diary Records */}
          <section className="p-10 lg:p-16">
            <span className="block text-[10px] uppercase tracking-[0.3em] font-bold text-[#A3A3A3] mb-8">Diary Records</span>
            {item.logs && item.logs.length > 0 ? (
              <div className="flex flex-col">
                {item.logs.map((log: any) => (
                  <div key={log.id} className="flex justify-between items-center py-6 border-b border-[#F0F0F0] last:border-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-serif italic">{format(new Date(log.date), "MMM d, yyyy")}</span>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#737373]">{log.notes || "Logged as completed"}</span>
                    </div>
                    {log.rating && (
                      <span className="text-sm font-sans font-bold tracking-widest">{log.rating.toFixed(1)} / 10</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-serif italic text-[#737373]">No entries recorded in the diary yet.</p>
            )}
          </section>
        </main>

        {/* 3. Meta Panel (Right Panel) */}
        <aside className="w-[440px] hidden lg:flex flex-col bg-traced-bg">
          {/* Poster */}
          <div className="p-10 border-b border-hairline flex justify-center">
            <div className="w-full aspect-[2/3] border border-black bg-traced-surface relative group overflow-hidden">
              {item.posterUrl ? (
                <img 
                  src={item.posterUrl} 
                  alt={item.title} 
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-traced-gray uppercase tracking-widest text-[10px]">No Poster</div>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 border-b border-hairline">
            <div className="p-8 border-r border-hairline flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3]">Runtime</span>
              <span className="text-sm font-sans font-bold tracking-tight">{item.runtime ? `${item.runtime} MIN` : "N/A"}</span>
            </div>
            <div className="p-8 flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3]">Language</span>
              <span className="text-sm font-sans font-bold tracking-tight uppercase">{item.language || "English"}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="p-10 border-b border-hairline">
            <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3] mb-5">Genres</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {genresArray.filter((g: string) => g).map((genre: string) => (
                <span key={genre} className="text-lg font-serif italic">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Progress */}
          {(item.type === 'tv' || item.type === 'manga' || item.type === 'book') && (
            <div className="p-10">
              <span className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#A3A3A3] mb-6">Progress</span>
              <div className="w-full h-0.5 bg-hairline relative mb-4">
                <div className="absolute left-0 top-0 h-full bg-black transition-all duration-1000" style={{ width: '100%' }} />
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-sans font-bold tracking-tight">Completed</span>
                <span className="text-sm font-serif italic text-[#737373]">1/1</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
