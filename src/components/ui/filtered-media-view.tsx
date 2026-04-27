"use client";

import { useState } from "react";
import { MediaCard } from "./media-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { loadMoreAction } from "@/lib/actions/search";

type Tab = "all" | "watchlist" | "watched" | "liked" | "read" | "reading" | "played" | "owned";

interface FilteredMediaViewProps {
  initialItems: any[];
  userItems: any[]; 
  category: "watch" | "read" | "play";
}

export function FilteredMediaView({ initialItems, userItems, category }: FilteredMediaViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(2); // Starting from page 2
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const tabsByCategory: Record<string, { id: Tab; label: string }[]> = {
    watch: [
      { id: "all", label: "All" },
      { id: "watchlist", label: "Watchlist" },
      { id: "watched", label: "Watched" },
      { id: "liked", label: "Liked" },
    ],
    read: [
      { id: "all", label: "All" },
      { id: "read", label: "Read" },
      { id: "reading", label: "Reading" },
      { id: "watchlist", label: "Wishlist" },
    ],
    play: [
      { id: "all", label: "All" },
      { id: "played", label: "Played" },
      { id: "owned", label: "Owned" },
      { id: "watchlist", label: "Wishlist" },
    ]
  };

  const tabs = tabsByCategory[category] || tabsByCategory.watch;

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const result = await loadMoreAction(category, page);
    if (result.success && result.results) {
      if (result.results.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...result.results!]);
        setPage(prev => prev + 1);
      }
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const filteredItems = () => {
    switch (activeTab) {
      case "all":
        return items;
      case "watchlist":
        return userItems.filter(item => item.status === "planned");
      case "watched":
      case "read":
      case "played":
        return userItems.filter(item => item.status === "completed");
      case "reading":
        return userItems.filter(item => item.status === "in_progress");
      case "liked":
        return userItems.filter(item => item.isLiked);
      case "owned":
        return userItems.filter(item => item.isOwned); 
      default:
        return items;
    }
  };

  const currentItems = filteredItems();

  return (
    <div className="flex flex-col gap-10 w-full mt-10">
      {/* Navigation / Filters */}
      <div className="flex items-center gap-2 vault-container w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-6 py-2.5 text-[14px] transition-all duration-200 cursor-pointer whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-vault-dark text-vault-bg font-bold shadow-[0_4px_12px_rgba(44,46,44,0.15)]" 
                : "bg-[#2C2E2C0D] text-[#68685A] font-semibold hover:bg-[#2C2E2C1A]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      <div className="vault-container w-full pb-24 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-12 items-center"
          >
            {currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10 w-full">
                  {currentItems.map((item: any) => {
                    const mediaData = item.media || item;
                    return (
                      <MediaCard 
                        key={`${mediaData.id}-${Math.random()}`} // Ensure unique keys for infinite scroll
                        title={mediaData.title}
                        category={mediaData.category}
                        posterUrl={mediaData.posterUrl}
                        rating={mediaData.rating || item.rating}
                        slug={mediaData.slug}
                        year={mediaData.year}
                        type={mediaData.type}
                        description={mediaData.description}
                      />
                    );
                  })}
                </div>
                
                {activeTab === "all" && hasMore && (
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="mt-8 btn-outline w-[240px] border-[#2C2E2C1F] hover:bg-[#2C2E2C08] text-[15px]"
                  >
                    {loading ? "Discovering..." : "Load More"}
                  </button>
                )}
              </>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center gap-4 rounded-3xl bg-black/[0.03] w-full">
                <span className="text-4xl">🫙</span>
                <div>
                  <h3 className="text-[18px] font-bold text-vault-dark tracking-tight">Nothing here</h3>
                  <p className="text-[14px] font-medium text-vault-gray mt-1 max-w-sm mx-auto">You haven't logged any data in this specific sector yet.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
