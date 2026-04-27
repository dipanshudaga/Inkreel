"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  paramName: string;
  currentValue: string;
}

function FilterGroup({ label, options, paramName, currentValue }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createQueryString = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    return params.toString();
  };

  const selectedOption = options.find(o => o.value === currentValue) || { label: label, value: "all" };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 py-2 px-3 border-hairline bg-white hover:bg-black/5 transition-colors uppercase tracking-widest font-sans font-bold text-[10px]",
          currentValue !== "all" && currentValue !== "" ? "text-traced-accent border-traced-accent" : "text-[#737373]"
        )}
      >
        <span>{currentValue !== "all" && currentValue !== "" ? selectedOption.label : label}</span>
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border-hairline z-[60] py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <Link
                key={option.value}
                href={`${pathname}?${createQueryString(option.value)}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-2 hover:bg-traced-surface text-[11px] uppercase tracking-wider font-sans transition-colors",
                  currentValue === option.value ? "text-traced-accent font-bold" : "text-traced-dark"
                )}
              >
                {option.label}
                {currentValue === option.value && <Check size={12} />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar({ 
  genres, 
  decades,
  currentFilters 
}: { 
  genres: string[], 
  decades: string[],
  currentFilters: {
    filter: string;
    type: string;
    genre: string;
    decade: string;
    sort: string;
  }
}) {
  const categories = [
    { label: "All", value: "all" },
    { label: "Watched", value: "watched" },
    { label: "Watchlist", value: "watchlist" },
    { label: "Love", value: "love" },
  ];

  const types = [
    { label: "All Types", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "TV Shows", value: "tv" },
    { label: "Anime", value: "anime" },
  ];

  const sortOptions = [
    { label: "When Logged (Newest)", value: "logged_desc" },
    { label: "When Logged (Oldest)", value: "logged_asc" },
    { label: "Release Date (Newest)", value: "release_desc" },
    { label: "Release Date (Oldest)", value: "release_asc" },
    { label: "Rating (High to Low)", value: "rating_desc" },
    { label: "Title (A-Z)", value: "title_asc" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-b-hairline bg-traced-bg">
      <FilterGroup 
        label="Category" 
        options={categories} 
        paramName="filter" 
        currentValue={currentFilters.filter} 
      />
      <FilterGroup 
        label="Type" 
        options={types} 
        paramName="type" 
        currentValue={currentFilters.type} 
      />
      <FilterGroup 
        label="Genre" 
        options={[{ label: "Any Genre", value: "all" }, ...genres.map(g => ({ label: g, value: g }))]} 
        paramName="genre" 
        currentValue={currentFilters.genre} 
      />
      <FilterGroup 
        label="Decade" 
        options={[{ label: "Any Decade", value: "all" }, ...decades.map(d => ({ label: d, value: d }))]} 
        paramName="decade" 
        currentValue={currentFilters.decade} 
      />
      
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-[#A3A3A3]">Sort by</span>
        <FilterGroup 
          label="Sort" 
          options={sortOptions} 
          paramName="sort" 
          currentValue={currentFilters.sort} 
        />
      </div>
    </div>
  );
}
