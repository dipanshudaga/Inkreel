"use client";

import Link from "next/link";
import Image from "next/image";
import { useMediaStore } from "@/store/use-media-store";
import { ActionBar } from "./action-bar";
import { Loader2, Search, Check, X } from "lucide-react";
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
    creator?: string;
    isStandup?: boolean;
    isDocumentary?: boolean;
    matched?: any;
  };
  variant?: "diary" | "import" | "search" | "rematch";
  index?: number;
  onClick?: () => void;
  onExclude?: () => void;
}

export function MediaCard({ item, variant = "diary", index = 10, onClick, onExclude }: MediaCardProps) {
  const storeItem = useMediaStore((state) => state.items[item.id || ""]);
  
  const isPriority = index < 10;
  const isRead = item.category === 'read' || item.type === 'book' || item.type === 'manga';
  const displayYear = item.releaseYear || item.year || "Unknown Year";
  
  const author = item.creator;
  const displayType = item.isStandup || item.type === "standup"
    ? "Standup Special"
    : item.isDocumentary
      ? "Documentary"
      : item.type === "anime"
        ? "Anime"
        : isRead && author
          ? author
          : (item.type || (isRead ? "Book" : "Movie"));

  // Determine if it should be a link or a button
  const isLink = variant === "diary" || variant === "search";
  const href = `/items/${item.id}?cat=${item.category || (isRead ? 'read' : 'watch')}`;

  const Container = isLink ? Link : "div";
  const containerProps = isLink
    ? { href, prefetch: true }
    : (variant !== "import" ? { onClick } : {});

  return (
    <Container
      {...containerProps as any}
      className={cn(
        "flex flex-col group gap-0 bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-700",
        (isLink || (variant !== "import" && onClick)) && "cursor-pointer"
      )}
    >
      {/* Poster Architecture */}
      <div className={cn(
        "relative aspect-[2/3] overflow-hidden bg-surface border-t-hairline border-x-hairline transition-all duration-500",
        variant !== "diary" && "border-b-hairline"
      )}>
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            priority={isPriority}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="size-full flex flex-col items-center justify-center bg-surface">
            {variant === "import" && item.matched === undefined ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-6 animate-spin text-accent" />
                <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-accent">Syncing</span>
              </div>
            ) : (
              <div className="size-full flex flex-col items-center justify-center p-8 text-center bg-surface/50 group-hover:bg-surface transition-colors duration-500">
                <span className="font-serif italic text-xl md:text-2xl opacity-20 group-hover:opacity-40 transition-opacity leading-tight">
                  {item.title}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Overlay (Import/Rematch) */}
        {(variant === "import" || variant === "rematch") && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 z-20">
            {variant === "import" && onExclude && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExclude();
                }}
                className="flex flex-col items-center gap-3 group/action"
              >
                <div className="size-11 rounded-full bg-white/20 text-white hover:bg-red-500 transition-all flex items-center justify-center transform scale-90 group-hover:scale-100 duration-500">
                  <X size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white opacity-70 group-hover/action:opacity-100 transition-opacity">Exclude</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="flex flex-col items-center gap-3 group/action"
            >
              <div className="size-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center transform scale-90 group-hover:scale-100 duration-500">
                {variant === "rematch" ? <Check size={22} strokeWidth={3} /> : <Search size={20} />}
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white opacity-70 group-hover/action:opacity-100 transition-opacity">
                {variant === "rematch" ? "Select" : "Rematch"}
              </span>
            </button>
          </div>
        )}

        {/* Hover Gradient (Visual depth) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
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
      <div className="mt-5 flex flex-col gap-1 px-0.5">
        <h3 className="text-dark font-serif font-medium text-xl leading-[1.1] pt-1 line-clamp-2 transition-colors duration-300 group-hover:text-accent">
          {item.title}
        </h3>
        <div className="flex items-center gap-2">
          {!isRead && (
            <>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-gray opacity-60">
                {displayYear}
              </span>
              <span className="size-0.5 bg-gray rounded-full opacity-20" />
            </>
          )}
          <span 
            title={item.creator}
            className={cn(
              "font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-gray opacity-60 line-clamp-2",
              isRead && "max-w-[180px]"
            )}
          >
            {displayType}
          </span>
        </div>
      </div>
    </Container>
  );
}
