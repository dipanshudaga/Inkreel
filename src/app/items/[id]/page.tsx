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

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = await db.query.media.findFirst({
    where: eq(media.id, id),
    with: {
      logs: {
        orderBy: [desc(logs.date)],
      },
    },
  });

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
             <div className="py-12 px-16 border-b-hairline flex flex-col gap-8">
               <h3 className="uppercase tracking-[0.05em] text-[#737373] font-sans font-semibold text-[13px]">
                 Synopsis
               </h3>
               <p className="text-traced-dark font-serif text-xl leading-relaxed max-w-2xl">
                 {item.description || "No synopsis available for this title."}
               </p>
             </div>

             {/* Log Section */}
             <div className="py-12 px-16 flex flex-col gap-8 grow">
                <h3 className="uppercase tracking-[0.05em] text-[#737373] font-sans font-semibold text-[13px]">
                  Your Log
                </h3>

                {latestLog ? (
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center bg-[#EFEEE8] border-hairline p-6 divide-x divide-[#D4D4D4]">
                      <div className="flex flex-col gap-2 pr-12">
                        <span className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-medium">Rating</span>
                        <div className="flex gap-1 text-traced-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              fill={i < Math.floor(item.rating || 0) ? "currentColor" : "none"} 
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 px-12">
                        <span className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-medium">Date Logged</span>
                        <span className="text-traced-dark font-sans font-medium text-[15px]">
                          {format(new Date(latestLog.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 pl-12">
                        <span className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-medium">Tags</span>
                        <div className="flex gap-2">
                           <span className="px-2 py-0.5 border-hairline text-traced-dark font-sans text-[11px] bg-white">Sci-Fi</span>
                           <span className="px-2 py-0.5 border-hairline text-traced-dark font-sans text-[11px] bg-white">Epic</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-hairline p-10">
                       <p className="text-traced-dark font-serif text-2xl italic leading-relaxed">
                         {latestLog.notes || "No notes for this entry."}
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 border-hairline border-dashed bg-white/50 gap-4">
                    <span className="text-[#737373] font-sans text-sm uppercase tracking-widest">No logs found</span>
                    <LogButton mediaId={item.id} type={item.type} />
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="h-20 shrink-0 flex items-center justify-between px-16 bg-traced-bg border-t-hairline z-10">
        <Link 
          href={item.type === 'book' || item.type === 'manga' ? '/read' : '/watch'} 
          className="flex items-center gap-3 text-traced-dark hover:gap-4 transition-all"
        >
          <ArrowLeft size={18} />
          <span className="uppercase tracking-[0.1em] font-sans text-[13px] font-medium">Back to Archive</span>
        </Link>
        
        <div className="flex items-center gap-12">
           <span className="uppercase tracking-[0.1em] text-[#737373] font-sans text-[13px] font-medium">
             {item.title}
           </span>
           <LogButton mediaId={item.id} type={item.type} />
        </div>
      </footer>
    </div>
  );
}
