"use client";

import Link from "next/link";
import { useMediaStore } from "@/store/use-media-store";
import { ActionBar } from "./action-bar";

interface MediaCardProps {
  item: {
    id: string;
    title: string;
    posterUrl: string | null;
    releaseYear: number | null;
    year?: number | null;
    status: string | null;
    type: string;
    category?: string;
  };
}

export function MediaCard({ item }: MediaCardProps) {
  const storeItem = useMediaStore((state) => state.items[item.id]);

  const isRead = item.category === 'read' || item.type === 'book' || item.type === 'manga';

  return (
    <div className="flex flex-col group gap-0 bg-transparent">
      {/* 2. Poster */}
      <Link 
        href={`/items/${item.id}?cat=${item.category || (isRead ? 'read' : 'watch')}`} 
        className="block relative aspect-[2/3] overflow-hidden border-hairline bg-traced-surface"
        prefetch={false}
      >
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            className="size-full object-cover transition-all duration-700 group-hover:scale-[1.02]"
            alt={item.title}
          />
        ) : (
          <div className="size-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest font-bold font-sans">
            No Poster
          </div>
        )}
      </Link>

      {/* 3. Action Bar (Unified) */}
      <ActionBar 
        mediaId={item.id} 
        variant="grid" 
        initialStatus={item.status}
        item={item}
      />

      {/* 4. Metadata */}
      <div className="mt-4 flex flex-col gap-1 px-1">
        <Link 
          href={`/items/${item.id}?cat=${item.category || (item.type === 'book' || item.type === 'manga' ? 'read' : 'watch')}`} 
          className="text-traced-dark font-serif font-medium text-xl leading-[1.2] line-clamp-2 hover:text-traced-accent transition-colors duration-300"
          prefetch={false}
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-traced-gray">
            {item.releaseYear || item.year || "Unknown Year"}
          </span>
          <span className="size-1 bg-traced-gray rounded-full opacity-30" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-traced-gray">
            {item.type}
          </span>
        </div>
      </div>
    </div>
  );
}
