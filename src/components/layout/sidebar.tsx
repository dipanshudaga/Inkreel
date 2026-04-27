"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchStore } from "@/store/use-search-store";
import { useQuickLogStore } from "@/store/use-quick-log-store";

export function Sidebar() {
  const { open } = useSearchStore();

  const [counts, setCounts] = useState({ watch: 0, read: 0 });

  useEffect(() => {
    fetch("/api/media/counts")
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className="flex flex-col shrink-0 h-full w-[288px] border-r-hairline bg-traced-bg fixed top-0 left-0 z-50">
      {/* Branding */}
      <div className="flex flex-col py-8 px-6 gap-12 border-b-hairline">
        <Link href="/" className="tracking-[-0.02em] text-traced-dark font-serif font-medium italic text-4xl">
          Traced.
        </Link>
      </div>

      <div className="flex flex-col grow">
        {/* Diaries Section */}
        <div className="flex flex-col border-b-hairline">
          <div className="py-4 px-6 border-b-hairline">
            <h2 className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px]">
              Diaries
            </h2>
          </div>
          <Link href="/watch" className="items-center flex justify-between py-4 px-6 hover:bg-black/5 transition-colors cursor-pointer text-left">
            <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-sm text-left">
              Watch
            </span>
            <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-medium text-xs">
              {counts.watch}
            </span>
          </Link>
          <Link href="/read" className="items-center flex justify-between py-4 px-6 hover:bg-black/5 transition-colors cursor-pointer text-left">
            <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-sm text-left">
              Read
            </span>
            <span className="tracking-[0.05em] uppercase text-[#737373] font-sans font-medium text-xs">
              {counts.read}
            </span>
          </Link>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col border-b-hairline">
          <div className="py-4 px-6 border-b-hairline">
            <h2 className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px]">
              Actions
            </h2>
          </div>
          <button 
            onClick={() => useQuickLogStore.getState().openQuickLog()}
            className="items-center flex py-4 px-6 gap-3 hover:bg-traced-surface transition-colors w-full cursor-pointer group"
          >
            <Plus size={16} className="text-[#737373] group-hover:text-traced-accent transition-colors" strokeWidth={2} />
            <span className="tracking-[0.05em] uppercase text-[#737373] group-hover:text-traced-accent font-sans font-medium text-sm transition-colors">
              Quick Log
            </span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col mt-auto">
          <button 
            onClick={open}
            className="items-center flex justify-between py-4 px-6 border-t-hairline hover:bg-black/5 transition-colors w-full cursor-pointer"
          >
            <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-[13px]">
              Search
            </span>
            <kbd className="inline-flex items-center py-0.5 px-1.5 border-hairline tracking-[0.05em] uppercase text-[#737373] font-sans font-medium text-[11px]">
              Cmd+K
            </kbd>
          </button>
          <button 
            onClick={() => alert("CSV Import coming soon!")}
            className="items-center flex justify-between py-4 px-6 border-t-hairline hover:bg-black/5 transition-colors w-full cursor-pointer text-left"
          >
            <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-[13px]">
              Import
            </span>
          </button>
          <button 
            onClick={() => alert("Settings coming soon!")}
            className="items-center flex justify-between py-4 px-6 border-t-hairline hover:bg-black/5 transition-colors w-full cursor-pointer text-left"
          >
            <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-[13px]">
              Settings
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
