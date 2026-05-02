"use client";

import { useState } from "react";
import { useMediaStore } from "@/store/use-media-store";
import { MediaCard } from "@/components/item/media-card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DiaryTimelineProps {
  initialItems: any[];
  currentFilter: string;
  category: "watch" | "read";
}

export function DiaryTimeline({ initialItems, currentFilter, category }: DiaryTimelineProps) {
  const storeItems = useMediaStore((state) => state.items);
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({});

  const toggleYear = (year: string) => {
    setCollapsedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Filter items based on store overrides (same logic as DiaryGrid)
  const filteredItems = initialItems.filter((item) => {
    const storeItem = storeItems[item.id];
    const status = storeItem ? storeItem.status : item.status;
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

  // Group by Year (Added Year)
  const groupedByYear = filteredItems.reduce((acc: Record<string, any[]>, item) => {
    const year = new Date(item.createdAt).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  if (filteredItems.length === 0 && initialItems.length > 0) {
    return (
      <div className="w-full py-32 text-center flex flex-col items-center gap-4">
        <p className="text-gray font-serif italic text-3xl">The timeline is currently silent.</p>
        <p className="text-[#737373] font-sans text-[10px] uppercase tracking-[0.2em] font-medium">Try adding or logging new titles to see your history.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24">
      {years.map((year) => {
        const isCollapsed = collapsedYears[year];
        return (
          <section key={year} className="flex flex-col gap-12">
            <button 
              onClick={() => toggleYear(year)}
              className="flex items-center gap-6 w-full text-left group transition-all outline-none"
            >
              <div className="flex items-center gap-4">
                <ChevronDown 
                  size={32} 
                  strokeWidth={1.5}
                  className={cn(
                    "opacity-10 group-hover:opacity-40 transition-all duration-500",
                    isCollapsed && "-rotate-90"
                  )} 
                />
                <h2 className={cn(
                  "text-3xl font-serif italic font-medium select-none transition-all duration-500 flex items-baseline gap-4 text-dark",
                  isCollapsed ? "opacity-30" : "opacity-100"
                )}>
                  {year}
                  <span className="text-lg not-italic opacity-40">({groupedByYear[year].length})</span>
                </h2>
              </div>
              <div className="h-px grow bg-dark/5" />
              <div className="flex flex-col items-end gap-1">
                <span className={cn(
                  "text-[8px] uppercase tracking-[0.4em] font-sans transition-all duration-500 overflow-hidden",
                  isCollapsed ? "h-3 opacity-20" : "h-0 opacity-0"
                )}>
                  Tap to Expand
                </span>
              </div>
            </button>

            {!isCollapsed && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-forwards">
                {groupedByYear[year].map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
