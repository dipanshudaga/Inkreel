"use client";

import { useSearchStore } from "@/store/use-search-store";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function SearchModal() {
  const { isOpen, close, query, setQuery } = useSearchStore();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useSearchStore.getState().open();
      }
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/media/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[#F7F5F0]/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
    >
      <div 
        className="w-[720px] flex flex-col bg-traced-bg border border-[#1A1A1A] shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center py-6 px-8 gap-4 border-b border-[#1A1A1A]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="square">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search your archive or add new..."
            className="grow bg-transparent border-none outline-none text-traced-dark font-serif italic text-[32px] placeholder:text-traced-gray/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="py-1 px-2 border border-[#1A1A1A] bg-white">
            <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-medium text-[11px]">
              ESC
            </span>
          </div>
        </div>

        <div className="flex flex-col py-4 max-h-[60vh] overflow-y-auto">
          {query.length > 0 && results.length === 0 && !isLoading && (
            <div className="px-8 py-4 text-traced-gray font-sans text-sm uppercase tracking-wider">
              No results found. Press Enter to search global database.
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Categorized results */}
              {['movie', 'tv', 'anime', 'book', 'manga'].map(type => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className="flex flex-col">
                    <div className="py-2 px-8">
                      <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[11px]">
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </span>
                    </div>
                    {typeResults.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center py-3 px-8 gap-4 cursor-pointer hover:bg-traced-surface transition-colors border-l-2 ${idx === 0 && type === results[0].type ? 'border-traced-accent bg-traced-surface' : 'border-transparent'}`}
                        onClick={() => {
                          router.push(`/items/${item.id}`);
                          close();
                        }}
                      >
                        <div className="w-10 h-15 shrink-0 overflow-hidden bg-[#CCCCCC] border border-[#1A1A1A]">
                          {item.posterUrl && (
                            <div 
                              className="bg-cover bg-center grayscale size-full" 
                              style={{ backgroundImage: `url(${item.posterUrl})` }} 
                            />
                          )}
                        </div>
                        <div className="grow">
                          <div className="text-[20px] leading-tight text-traced-dark font-serif">
                            {item.title}
                          </div>
                          <div className="uppercase tracking-[0.05em] mt-1 text-[#737373] font-sans text-xs">
                            {item.year} • {
                              item.status 
                                ? (item.completedAt ? `Logged ${format(new Date(item.completedAt), "MMM d, yyyy")}` : 'In Archive')
                                : 'Global Database'
                            }
                          </div>
                        </div>
                        <div className="text-traced-dark font-sans font-medium text-sm">
                          {item.rating ? (typeof item.rating === 'number' ? "★".repeat(Math.floor(item.rating)) + (item.rating % 1 !== 0 ? "½" : "") : item.rating) : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center py-4 px-8 bg-traced-bg border-t border-[#1A1A1A]">
          <span className="tracking-[0.05em] uppercase text-[#737373] font-sans text-[11px]">
            Press Enter to select • Use arrows to navigate
          </span>
        </div>
      </div>
    </div>
  );
}
