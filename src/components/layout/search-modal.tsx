"use client";

import { useSearchStore } from "@/store/use-search-store";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchModal() {
  const { isOpen, close, query, setQuery } = useSearchStore();
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
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
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-bg/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={close}
    >
      <div 
        className="w-[720px] flex flex-col bg-bg border-hairline animate-in zoom-in-95 slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center py-6 px-8 gap-4 border-b-hairline">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-dark" strokeWidth="2" strokeLinecap="square">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Add to your diary"
            className="grow bg-transparent border-none outline-none text-dark font-serif italic text-[32px] placeholder:text-gray/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={() => query ? setQuery("") : close()}
            className="p-2 hover:bg-surface transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray" strokeWidth="2" strokeLinecap="square">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-8 py-3 bg-surface border-b-hairline">
          {['all', 'movie', 'tv', 'anime', 'book', 'manga'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest font-medium border transition-all duration-200 ${
                activeFilter === f 
                  ? 'bg-dark text-white border-dark' 
                  : 'bg-white text-gray border-dark/10 hover:border-dark hover:text-dark'
              }`}
            >
              {f === 'all' ? 'All' : f === 'tv' ? 'TV Shows' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
            </button>
          ))}
        </div>

        <div className="flex flex-col py-4 max-h-[60vh] overflow-y-auto">
          {query.length > 0 && results.length === 0 && !isLoading && (
            <div className="px-8 py-4 text-gray font-sans text-sm uppercase tracking-wider">
              No results found.
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Categorized results */}
              {['movie', 'tv', 'anime', 'book', 'manga'].map(type => {
                if (activeFilter !== 'all' && activeFilter !== type) return null;
                
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className="flex flex-col">
                    <div className="py-2 px-8 flex items-center justify-between">
                      <span className="tracking-[0.05em] uppercase text-gray font-sans font-medium text-[11px]">
                        {type === 'tv' ? 'TV Shows' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                      </span>
                      <span className="text-[10px] text-gray font-sans uppercase tracking-widest">
                        {typeResults.length} {typeResults.length === 1 ? 'result' : 'results'}
                      </span>
                    </div>
                    {typeResults.map((item, idx) => {
                      let sublabel = "";
                      const hasCreator = item.creator && !item.creator.toLowerCase().includes("unknown") && item.creator !== "Movie" && item.creator !== "TV Series";
                      
                      if (hasCreator) {
                        sublabel += `${item.creator} • `;
                      }

                      if (item.type === 'anime' && item.format) {
                        sublabel += `${item.format.replace('_', ' ')} • `;
                      }
                      
                      sublabel += item.year || "N/A";
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`flex items-center py-3 px-8 gap-4 cursor-pointer hover:bg-surface transition-colors border-l-2 ${idx === 0 && (activeFilter !== 'all' || type === results[0].type) ? 'border-accent bg-surface' : 'border-transparent'}`}
                          onClick={() => {
                            const cat = (item.type === 'book' || item.type === 'manga') ? 'read' : 'watch';
                            router.push(`/items/${item.id}?cat=${cat}`);
                            close();
                          }}
                        >
                          <div className="w-10 h-15 shrink-0 overflow-hidden bg-surface border-hairline">
                            {item.posterUrl ? (
                              <img 
                                src={item.posterUrl} 
                                className="size-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-gray text-[8px] uppercase tracking-widest text-center px-1">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div className="grow">
                            <div className="text-[20px] leading-tight text-dark font-serif">
                              {item.title}
                            </div>
                            <div className="uppercase tracking-[0.05em] mt-1 text-gray font-sans text-xs">
                              {sublabel}{item.status ? ` • ${item.status}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center py-4 px-8 bg-surface border-t-hairline">
          <span className="tracking-[0.05em] uppercase text-gray font-sans text-[11px]">
            Press Enter to select • Use arrows to navigate
          </span>
        </div>
      </div>
    </div>
  );
}
