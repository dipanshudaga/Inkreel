import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { ExitButton } from "@/components/item/exit-button";
import { ActionBar } from "@/components/item/action-bar";
import { notFound, redirect } from "next/navigation";
import { getMovieById, getTVById } from "@/lib/api/tmdb";
import { getBookById } from "@/lib/api/google-books";
import { getAniListById } from "@/lib/api/anilist";

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

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
      // Map language code to name for display
      let languageName = item.language;
      try {
        if (freshData.languageCode && !item.language) {
          languageName = languageNames.of(freshData.languageCode) || item.language;
        }
      } catch (e) {}

      return {
        ...item,
        tagline: item.tagline || freshData.tagline,
        subtitle: item.subtitle || freshData.subtitle,
        format: item.format || freshData.format,
        language: languageName,
        description: item.description || freshData.description,
        creator: item.creator || freshData.creator,
        genres: item.genres || freshData.genres?.join(", "),
        runtime: item.runtime || freshData.runtime,
        pageCount: item.pageCount || freshData.pageCount,
        backdropUrl: item.backdropUrl || freshData.backdropUrl,
      };
    }
  } catch (error) {
    console.error("Enrichment failed:", error);
  }
  return item;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const session = await auth();
  
  let item: any = null;
  let isExternal = false;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUUID) {
    // If not logged in, redirect to login for private items
    if (!session) {
      redirect("/login");
    }

    const localItem = await db.query.media.findFirst({
      where: and(eq(media.id, id), eq(media.userId, session.user.id)),
    });
    if (localItem) {
      item = await enrichItem(localItem);
    }
  }

  // If not found in DB, try fetching as external
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

  const genresArray = (Array.isArray(item.genres) ? item.genres : (item.genres?.split(", ") || [])).slice(0, 4);
  const displayCreator = item.creator && !item.creator.toLowerCase().includes("unknown");

  return (
    <div className="min-h-screen bg-traced-bg text-traced-dark selection:bg-traced-accent selection:text-white pb-20 relative">
      <ExitButton href={item.category === 'read' ? '/read' : '/watch'} />

      {/* Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden group bg-traced-surface">
        {item.backdropUrl ? (
          <>
            <img 
              src={item.backdropUrl} 
              className="size-full object-cover opacity-20 grayscale-[0.5] transition-all duration-1000 group-hover:opacity-30 group-hover:grayscale-0"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-traced-bg via-transparent to-transparent" />
          </>
        ) : (
          <div className="size-full bg-traced-surface flex items-center justify-center">
             <div className="text-[120px] font-serif italic opacity-[0.03] select-none pointer-events-none">INKREEL</div>
          </div>
        )}
      </div>

      <div className="max-w-[1200px] mx-auto px-10 -mt-40 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Poster Column */}
          <aside className="w-72 flex-shrink-0">
            <div className="aspect-[2/3] border-hairline bg-traced-surface overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500">
              {item.posterUrl ? (
                <img src={item.posterUrl} alt={item.title} className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center text-[10px] uppercase tracking-widest opacity-30 font-bold">No Art</div>
              )}
            </div>
          </aside>

          {/* Content Column */}
          <main className="flex-1 flex flex-col pt-40">
            <header className="mb-14">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-1 bg-traced-dark text-traced-bg">
                  {item.format || item.type}
                </span>
                <span className="font-serif italic text-2xl opacity-40">{item.releaseYear || "N/A"}</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-serif font-medium italic tracking-[-0.05em] leading-[0.85] m-0 mb-3">
                {item.title}
              </h1>
              
              {(item.tagline || item.subtitle) && (
                <p className="text-2xl lg:text-3xl font-serif italic opacity-50 tracking-[-0.02em] leading-tight">
                  {item.tagline || item.subtitle}
                </p>
              )}

              {displayCreator && (
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-widest opacity-30">
                    {item.category === 'read' ? 'Authored by' : 'Visualized by'}
                  </span>
                  <span className="font-serif text-2xl italic opacity-80">{item.creator}</span>
                </div>
              )}
            </header>

            <section className="mb-16">
              <span className="block text-[9px] uppercase tracking-[0.3em] font-bold text-traced-gray mb-6 border-b border-traced-dark pb-2 w-fit">Synopsis</span>
              <p className="text-xl font-serif leading-relaxed max-w-2xl opacity-90 first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                {item.description?.replace(/<[^>]*>?/gm, '') || "In the vast expanse of the archive, this particular narrative remains partially veiled."}
              </p>
            </section>

            {/* 3-Column Metadata Grid */}
            <div className="grid grid-cols-3 gap-8 py-10 border-t border-traced-dark/20">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-traced-gray">Language</span>
                <span className="font-serif italic text-xl">{item.language || "Native"}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-traced-gray">Composition</span>
                <div className="flex flex-wrap gap-1 font-serif italic text-xl">
                  {genresArray.filter((g: string) => g).map((genre: string, idx: number) => (
                    <span key={genre}>{genre}{idx < genresArray.length - 1 ? "," : ""}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-traced-gray">
                  {item.category === 'read' ? 'Quantity' : 'Duration'}
                </span>
                <span className="font-serif italic text-xl">
                  {item.category === 'read' 
                    ? `${item.pageCount || "—"} Pages` 
                    : `${item.runtime || "—"} Minutes`}
                </span>
              </div>
            </div>
          </main>

          {/* Action Sidebar */}
          <aside className="w-full lg:w-72 pt-40">
            <div className="border-hairline bg-traced-surface p-10 flex flex-col gap-10 sticky top-10 items-center">
              <ActionBar
                initialStatus={item.status}
                mediaId={item.id}
                isExternal={isExternal}
                variant="compact"
                item={item}
              />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
