"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function DiarySearch({ currentQuery = "" }: { currentQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const currentQ = currentParams.get("q") || "";
    
    // Only trigger update if query actually changed
    if (searchQuery === currentQ) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, pathname, router]);

  return (
    <div className="relative group flex items-center">
      <div className="absolute left-0 opacity-40 group-focus-within:opacity-100 transition-opacity">
        <Search size={18} strokeWidth={1.5} />
      </div>
      <input
        type="text"
        placeholder="Search your diary..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-transparent border-b border-dark/10 focus:border-dark/30 py-3 pl-8 pr-8 text-lg font-serif italic focus:outline-none transition-all w-72 placeholder:opacity-30 placeholder:italic"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-0 p-2 opacity-40 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
