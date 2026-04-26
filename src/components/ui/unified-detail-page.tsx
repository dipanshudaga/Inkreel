import { getMediaBySlug } from "@/lib/api/mock";
import { notFound } from "next/navigation";
import { StarRating } from "@/components/ui/star-rating";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function UnifiedDetailPage({ params, searchParams, category }: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>,
  category?: string
}) {
  const { slug } = await params;
  const media = await getMediaBySlug(slug, category);

  if (!media) {
    notFound();
  }

  // Determine category-specific classes
  const accentClass = 
    media.category === "watch" ? "text-vault-watch" : 
    media.category === "read" ? "text-vault-read" : 
    "text-vault-play";
    
  const accentBgClass = 
    media.category === "watch" ? "bg-vault-watch" : 
    media.category === "read" ? "bg-vault-read" : 
    "bg-vault-play";

  return (
    <div className="relative flex flex-col min-h-screen pt-24 pb-32 vault-container">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-16 xl:gap-24 items-start">
        
        {/* Left Column: Poster Image */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[20px] bg-[#EDE6D8] border border-vault-dark/5">
            <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col gap-8 pt-4">
          
          {/* Metadata & Title */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <span className={cn("text-[14px] font-extrabold tracking-[1px] uppercase", accentClass)}>
                 {media.category}
               </span>
               <div className="w-1 h-1 rounded-full bg-vault-dark/20" />
               <span className="text-[14px] font-semibold text-vault-gray">{media.year}</span>
               {media.duration && (
                 <>
                   <div className="w-1 h-1 rounded-full bg-vault-dark/20" />
                   <span className="text-[14px] font-semibold text-vault-gray">{media.duration} mins</span>
                 </>
               )}
               {media.pageCount && (
                 <>
                   <div className="w-1 h-1 rounded-full bg-vault-dark/20" />
                   <span className="text-[14px] font-semibold text-vault-gray">{media.pageCount} pages</span>
                 </>
               )}
            </div>
            
            <h1 className="text-[56px] font-extrabold tracking-[-1.5px] text-vault-dark leading-[1.05]">
              {media.title}
            </h1>
            
            <p className="text-[18px] font-medium text-vault-gray leading-[1.4]">
              {media.category === "watch" ? "A film by" : 
               media.category === "read" ? "Written by" : 
               "Designed by"} <span className="text-vault-dark font-extrabold">{media.creator}</span>
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 py-4 border-y border-vault-dark/5">
            <button className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
               Log Entry
            </button>
            <div className="flex items-center gap-2 ml-4">
               <StarRating value={media.rating} size="md" className={accentClass} />
               <span className="text-[15px] font-bold text-vault-dark ml-2">{media.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-4 mt-2">
             <h3 className="text-[14px] font-bold uppercase tracking-[1px] text-vault-gray">Synopsis</h3>
             <p className="text-[18px] leading-[1.6] text-vault-dark tracking-[-0.01em] max-w-3xl font-medium">
               {media.description}
             </p>
          </div>

          {/* Details / Genres */}
          <div className="flex flex-col gap-4 mt-8">
            <h3 className="text-[14px] font-bold uppercase tracking-[1px] text-vault-gray">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {media.genres.map(g => (
                <div key={g} className="px-4 py-2 rounded-full bg-black/[0.03] text-[14px] font-bold text-vault-dark">
                  {g}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
