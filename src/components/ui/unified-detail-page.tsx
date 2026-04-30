import { getMediaBySlug } from "@/lib/api/mock";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";
import { DetailLogButton } from "./detail-log-button";

export default async function UnifiedDetailPage({ params, category }: { 
  params: Promise<{ slug: string }>,
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>,
  category?: string
}) {
  const { slug } = await params;
  const media = await getMediaBySlug(slug, category);

  if (!media) {
    notFound();
  }

  return (
    <div className="grow flex flex-col min-h-screen bg-bg">
      {/* Backdrop Section (if available) */}
      {media.backdropUrl && (
        <div className="w-full h-80 relative overflow-hidden border-b-hairline bg-surface">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale opacity-30"
            style={{ backgroundImage: `url(${media.backdropUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto w-full px-12 py-16 flex flex-col lg:flex-row gap-20">
        {/* Left Column: Poster */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="aspect-[2/3] w-full bg-surface border-hairline overflow-hidden shadow-2xl relative">
            {media.posterUrl ? (
              <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover grayscale-25" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray text-[10px] uppercase tracking-widest">
                No Cover
              </div>
            )}
          </div>
          
          <div className="mt-12 flex flex-col gap-8">
            <DetailLogButton media={media} />
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="flex flex-col gap-10 flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="uppercase tracking-[0.2em] text-accent font-sans text-[11px] font-medium">
                {media.type || media.category}
              </span>
              <div className="h-px w-8 bg-dark/10" />
              <span className="uppercase tracking-[0.2em] text-gray font-sans text-[11px]">
                {media.year}
              </span>
              {media.runtime && (
                <>
                  <div className="h-px w-4 bg-dark/10" />
                  <span className="uppercase tracking-[0.2em] text-gray font-sans text-[11px]">
                    {media.runtime} {media.category === 'read' ? 'pages' : 'mins'}
                  </span>
                </>
              )}
            </div>
            
            <h1 className="text-[64px] leading-[1.05] tracking-[-0.03em] text-dark font-serif font-medium italic m-0">
              {media.title}
            </h1>
            
            <div className="flex items-center gap-4">
               <span className="text-xl text-gray font-serif italic">Directed by</span>
               <span className="text-2xl text-dark font-serif font-medium underline decoration-accent/30 underline-offset-8">
                 {media.creator}
               </span>
            </div>
          </div>

          <div className="h-px w-full bg-dark/10" />

          <div className="flex flex-col gap-6">
            <h3 className="uppercase tracking-[0.2em] text-gray font-sans text-[11px] font-medium">
              Synopsis
            </h3>
            <p className="text-xl leading-relaxed text-dark font-serif max-w-2xl">
              {media.description || "No synopsis available."}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="uppercase tracking-[0.2em] text-gray font-sans text-[11px] font-medium">
              Genres
            </h3>
            <div className="flex flex-wrap gap-3">
              {media.genres.map((genre) => (
                <span 
                  key={genre} 
                  className="px-4 py-1.5 border-hairline text-dark font-sans text-[12px] uppercase tracking-wider bg-white"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
