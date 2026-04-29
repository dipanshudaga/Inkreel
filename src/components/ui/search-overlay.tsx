"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchMediaAction } from "@/lib/actions/search";
import { MediaItem } from "@/lib/api/mock";
import Link from "next/link";

export function SearchOverlay({ 
  isOpen, 
  onClose, 
  defaultCategory 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  defaultCategory?: "watch" | "read" | "play";
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const res = await searchMediaAction(query);
          if (res.success && res.results) {
            setResults(res.results);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-traced-dark/40 backdrop-blur-sm flex items-start justify-center pt-32 p-6"
      onClick={onClose}
    >
      <div 
        className="flex bg-traced-bg flex-col w-full max-w-2xl border-hairline shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex bg-white border-b-hairline p-8 gap-6 items-center">
          <Search className="h-6 w-6 text-traced-dark shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search the archive..."
            className="text-[28px] text-traced-dark font-serif font-medium w-full outline-none placeholder:text-[#A3A3A3] italic"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-traced-accent ml-2 shrink-0" />}
          <button 
            onClick={onClose}
            className="border-hairline py-2 px-4 bg-traced-surface hover:bg-traced-dark hover:text-white transition-all shrink-0 cursor-pointer font-sans font-bold text-[11px] uppercase tracking-widest"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col p-4 gap-2 max-h-[500px] overflow-y-auto bg-traced-bg">
          {query.trim().length > 1 && results.length === 0 && !isLoading && (
            <div className="text-center py-20">
               <p className="text-[14px] uppercase tracking-[0.2em] text-[#737373] font-sans font-bold">No results found</p>
               <p className="text-traced-dark font-serif italic mt-2">Try a different title or category</p>
            </div>
          )}

          {results.map((item) => {
            const formattedType = item.type 
              ? item.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : item.category.charAt(0).toUpperCase() + item.category.slice(1);

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                onClick={onClose}
                className="flex items-center gap-6 p-4 hover:bg-white border border-transparent hover:border-hairline transition-all cursor-pointer group"
              >
                <div className="h-20 w-14 shrink-0 bg-traced-surface border-hairline overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-[8px] uppercase tracking-tighter text-[#A3A3A3]">No Image</div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <span className="text-[18px] font-serif font-medium text-traced-dark group-hover:text-traced-accent transition-colors truncate">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-sans font-bold text-[#737373] uppercase tracking-wider">{formattedType}</span>
                    <span className="text-[#D4D4D4] text-xs">•</span>
                    <span className="text-[11px] font-sans text-[#A3A3A3] uppercase tracking-wider">{item.year || "Unknown"}</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-traced-accent">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                   </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
