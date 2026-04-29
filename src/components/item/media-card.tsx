"use client";

import Link from "next/link";
import { useMediaStore } from "@/store/use-media-store";
import { ActionBar } from "./action-bar";
import { Loader2, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: {
    id: string;
    title: string;
    posterUrl: string | null;
    releaseYear?: number | null;
    year?: string | number | null;
    status?: string | null;
    type?: string;
    category?: string;
    matchedId?: string;
  };
  variant?: "diary" | "import" | "search";
  onClick?: () => void;
  showStatusIndicator?: boolean;
}

export function MediaCard({ item, variant = "diary", onClick, showStatusIndicator = false }: MediaCardProps) {
  const storeItem = useMediaStore((state) => state.items[item.id || ""]);

  const isRead = item.category === 'read' || item.type === 'book' || item.type === 'manga';
  const displayYear = item.releaseYear || item.year || "Unknown Year";
  const displayType = item.type || (isRead ? "Book" : "Movie");

  // Determine if it should be a link or a button
  const isLink = variant === "diary" || variant === "search";
  const href = `/items/${item.id}?cat=${item.category || (isRead ? 'read' : 'watch')}`;

  const Container = isLink ? Link : "div";
  const containerProps = isLink 
    ? { href, prefetch: false } 
    : { onClick };

  return (
    <Container 
      {...containerProps as any}
      className="flex flex-col group gap-0 bg-transparent cursor-pointer"
    >
      {/* Poster Architecture */}
      <div className="relative aspect-[2/3] overflow-hidden bg-traced-surface border-hairline shadow-sm group-hover:shadow-xl transition-all duration-500">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            className="size-full object-cover transition-all duration-1000 group-hover:scale-[1.05]"
            alt={item.title}
          />
        ) : (
          <div className="size-full flex flex-col items-center justify-center gap-3 bg-traced-surface">
            {item.matchedId === undefined && variant === "import" ? (
              <>
                <Loader2 size={24} className="animate-spin text-traced-accent" />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-20">Syncing</span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-10">
                <Search size={24} />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Missing</span>
              </div>
            )}
          </div>
        )}

        {/* Action Overlay (Import only) */}
        {variant === "import" && (
           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
              <div className="size-12 rounded-full bg-white text-black flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500">
                <Search size={24} />
              </div>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white">Rematch</span>
           </div>
        )}

        {/* Status indicator (Dot) */}
        {showStatusIndicator && (
          <div className={cn(
            "absolute top-3 right-3 size-2.5 rounded-full shadow-sm ring-2 ring-white/50 z-20",
            item.matchedId && item.matchedId !== "not-found" ? "bg-green-500" : "bg-yellow-500"
          )} />
        )}

        {/* Hover Gradient (Visual depth) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Action Bar (Diary only - Consistent grid UI) */}
      {variant === "diary" && (
        <ActionBar 
          mediaId={item.id} 
          variant="grid" 
          initialStatus={item.status || null}
          item={item as any}
        />
      )}

      {/* Unified Typography System */}
      <div className="mt-5 flex flex-col gap-1.5 px-0.5">
        <h3 className="text-traced-dark font-serif font-medium text-xl leading-[1.2] line-clamp-2 transition-colors duration-300 group-hover:text-traced-accent italic">
          {item.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-traced-gray opacity-60">
            {displayYear}
          </span>
          <span className="size-0.5 bg-traced-gray rounded-full opacity-20" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-traced-gray opacity-60">
            {displayType}
          </span>
        </div>
      </div>
    </Container>
  );
}
