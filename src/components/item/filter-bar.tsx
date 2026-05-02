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
  align?: "left" | "right";
  showClear?: boolean;
}

function FilterGroup({ label, options, paramName, currentValue, align, showClear = true }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
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

  // Close dropdown when search params change (navigation happens)
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    setIsOpen(false);
  }, [searchParamsString]);

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
  const isFiltered = currentValue !== "all" && currentValue !== "";

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center gap-1.5 py-2 px-3 border-hairline transition-colors uppercase tracking-widest font-sans font-medium text-[10px]",
          isFiltered ? "text-accent border-accent bg-white" : "text-dark bg-white hover:bg-black/5",
          isFiltered && "border-r-0 pr-1.5"
        )}
      >
        <span>{isFiltered ? selectedOption.label : label}</span>
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {showClear && isFiltered && (
        <Link
          href={`${pathname}?${createQueryString("all")}`}
          className="flex items-center justify-center h-[31px] px-2 border-hairline border-l-0 text-accent hover:bg-accent hover:text-white transition-colors"
          title="Clear filter"
          scroll={false}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Link>
      )}

      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 w-60 bg-white border-hairline z-[60] py-1 animate-in fade-in slide-in-from-top-1 duration-200 shadow-2xl",
          align === "right" ? "right-0" : "left-0"
        )}>
          <div className="max-h-80 overflow-y-auto">
            {options.map((option) => (
              <Link
                key={option.value}
                href={`${pathname}?${createQueryString(option.value)}`}
                scroll={false}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface text-[10px] uppercase tracking-wider font-sans transition-colors text-left",
                  currentValue === option.value ? "text-accent font-medium bg-surface/50" : "text-dark"
                )}
              >
                <span>{option.label}</span>
                {currentValue === option.value && <Check size={12} className="text-accent" />}
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
  currentFilters,
  currentView = "grid",
  categoryOptions,
  typeOptions,
  categoryLabel,
  typeLabel
}: { 
  genres: string[], 
  decades: string[],
  currentFilters: {
    filter: string;
    type: string;
    genre: string;
    decade: string;
    sort: string;
  },
  currentView?: string,
  categoryOptions?: FilterOption[],
  typeOptions?: FilterOption[],
  categoryLabel?: string,
  typeLabel?: string
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    return params.toString();
  };

  const defaultCategories = [
    { label: "All", value: "all" },
    { label: "Watched", value: "watched" },
    { label: "Watchlist", value: "watchlist" },
    { label: "Love", value: "love" },
  ];

  const defaultTypes = [
    { label: "All Types", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "TV Shows", value: "tv" },
    { label: "Anime", value: "anime" },
    { label: "Documentary", value: "documentary" },
  ];

  const categories = categoryOptions || defaultCategories;
  const types = typeOptions || defaultTypes;

  const sortOptions = [
    { label: "When Logged (Newest)", value: "logged_desc" },
    { label: "When Logged (Oldest)", value: "logged_asc" },
    { label: "Release Date (Newest)", value: "release_desc" },
    { label: "Release Date (Oldest)", value: "release_asc" },
    { label: "Title (A-Z)", value: "title_asc" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 bg-bg relative z-10">
      {/* View Switcher */}
      <div className="flex border-hairline bg-white overflow-hidden mr-2">
        <Link 
          href={`${pathname}?${createQueryString("view", "grid")}`}
          className={cn(
            "px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium transition-all",
            currentView === "grid" ? "bg-dark text-white" : "text-dark hover:bg-black/5"
          )}
        >
          Grid
        </Link>
        <Link 
          href={`${pathname}?${createQueryString("view", "timeline")}`}
          className={cn(
            "px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-sans font-medium border-l border-dark/10 transition-all",
            currentView === "timeline" ? "bg-dark text-white" : "text-dark hover:bg-black/5"
          )}
        >
          Timeline
        </Link>
      </div>



      <FilterGroup 
        label={categoryLabel || "Category"} 
        options={categories} 
        paramName="filter" 
        currentValue={currentFilters.filter} 
        align="left"
      />
      <FilterGroup 
        label={typeLabel || "Type"} 
        options={types} 
        paramName="type" 
        currentValue={currentFilters.type} 
        align="left"
      />
      <FilterGroup 
        label="Genre" 
        options={[{ label: "Any Genre", value: "all" }, ...genres.map(g => ({ label: g, value: g }))]} 
        paramName="genre" 
        currentValue={currentFilters.genre} 
        align="left"
      />
      <FilterGroup 
        label="Decade" 
        options={[{ label: "Any Decade", value: "all" }, ...decades.map(d => ({ label: d, value: d }))]} 
        paramName="decade" 
        currentValue={currentFilters.decade} 
        align="left"
      />
      
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest font-sans font-medium text-gray opacity-50">Sort</span>
        <FilterGroup 
          label="Sort" 
          options={sortOptions} 
          paramName="sort" 
          currentValue={currentFilters.sort} 
          align="right"
          showClear={false}
        />
      </div>
    </div>
  );
}
