"use client";

import { useMediaStore } from "@/store/use-media-store";
import { MediaCard } from "@/components/item/media-card";

interface DiaryGridProps {
  initialItems: any[];
  currentFilter: string;
  category: "watch" | "read";
}

export function DiaryGrid({ initialItems, currentFilter, category }: DiaryGridProps) {
  const storeItems = useMediaStore((state) => state.items);

  // Filter items based on store overrides
  const filteredItems = initialItems.filter((item) => {
    const storeItem = storeItems[item.id];
    
    // Use store data if available, otherwise fallback to item properties
    const status = storeItem ? storeItem.status : item.status;

    // If item has no status (removed from diary), hide it
    if (!status || status === "none") return false;

    if (currentFilter === "all") return true;

    if (currentFilter === "watched" || currentFilter === "read") {
      return status === "completed" || status === "loved";
    }
    if (currentFilter === "watchlist") {
      return status === "watchlist" || status === "shelf";
    }
    if (currentFilter === "love") {
      return status === "loved";
    }
    
    return true;
  });

  if (filteredItems.length === 0 && initialItems.length > 0) {
    return (
      <div className="w-full py-32 text-center flex flex-col items-center gap-4">
        <p className="text-[#A1A19A] font-serif italic text-3xl">This shelf is currently empty.</p>
        <p className="text-[#737373] font-sans text-xs uppercase tracking-widest font-medium">Try adjusting your filters or adding new titles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
      {filteredItems.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}
