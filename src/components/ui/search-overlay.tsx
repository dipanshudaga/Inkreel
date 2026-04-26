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
      className="fixed inset-0 z-[200] bg-[#2C2E2C99] flex items-start justify-center pt-32"
      onClick={onClose}
    >
      <div 
        className="flex bg-white flex-col w-[600px] rounded-2xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex border-b-[1.5px] border-[#2C2E2C1F] pb-4 gap-4 items-center">
          <Search className="h-6 w-6 text-[#2C2E2C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, books, games..."
            className="text-[24px] text-[#2C2E2C] font-semibold w-full outline-none placeholder:text-[#8A8A7A]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-[#8A8A7A] ml-2 shrink-0" />}
          <button 
            onClick={onClose}
            className="rounded-full py-1.5 px-3 bg-[#E8E8E8] hover:bg-[#D8D8D8] transition-colors shrink-0 cursor-pointer text-[#8A8A7A] font-bold text-[11px]"
          >
            ESC
          </button>
        </div>

        <div className="flex flex-col pt-6 gap-4 max-h-[400px] overflow-y-auto">
          {query.trim().length > 1 && results.length === 0 && !isLoading && (
            <div className="text-center py-10 text-[15px] font-medium text-[#8A8A7A]">
              No results found in the archives.
            </div>
          )}

          {results.map((item) => {
            let catBg = item.category === "watch" ? "bg-[#E8643B1A]" : item.category === "read" ? "bg-[#D4A8431A]" : "bg-[#5B8CA81A]";
            let catColor = item.category === "watch" ? "text-[#E8643B]" : item.category === "read" ? "text-[#D4A843]" : "text-[#5B8CA8]";
            const formattedSubType = item.subType 
              ? item.subType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : item.category.charAt(0).toUpperCase() + item.category.slice(1);

            return (
              <Link
                key={item.id}
                href={`/${item.category}/${item.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 py-2 hover:bg-[#FBF8F0] rounded-xl px-2 transition-colors cursor-pointer"
              >
                <div className="h-[60px] w-[40px] overflow-hidden rounded bg-[#EDE6D8] shrink-0">
                  <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[16px] font-bold text-[#2C2E2C] truncate">{item.title}</span>
                  <span className="text-[13px] font-medium text-[#8A8A7A]">{item.year} • {item.creator}</span>
                </div>
                <div className={`rounded-full py-1 px-3 ${catBg}`}>
                  <span className={`text-[12px] font-bold uppercase tracking-[0.5px] ${catColor}`}>
                    {formattedSubType}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
