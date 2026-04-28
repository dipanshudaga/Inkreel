"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, LogOut, User } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSearchStore } from "@/store/use-search-store";
import { useSession, signOut } from "next-auth/react";

export function Sidebar() {
  const { open } = useSearchStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [counts, setCounts] = useState({ watch: 0, read: 0 });

  useEffect(() => {
    if (session) {
      fetch("/api/media/counts")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch counts");
          return res.json();
        })
        .then((data) => setCounts(data))
        .catch((err) => console.error("Sidebar counts fetch failed:", err));
    }
  }, [session]);

  const activeCat = searchParams.get('cat') || (pathname.startsWith('/watch') ? 'watch' : pathname.startsWith('/read') ? 'read' : null);

  return (
    <aside className="flex flex-col shrink-0 h-full w-[288px] border-r-hairline bg-traced-bg fixed top-0 left-0 z-50">
      {/* Branding */}
      <div className="flex flex-col py-8 px-6 gap-12 border-b-hairline">
        <Link href="/" className="tracking-[-0.02em] text-traced-dark font-serif font-medium italic text-4xl">
          Inkreel.
        </Link>
      </div>

      <div className="flex flex-col grow">
        {/* Diaries Section */}
        <div className="flex flex-col border-b-hairline">
          <Link href="/watch" className={`items-center flex justify-between py-4 px-6 transition-colors cursor-pointer text-left ${activeCat === 'watch' ? 'bg-traced-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-semibold text-sm text-left ${activeCat === 'watch' ? 'text-white' : 'text-traced-dark'}`}>
              Watch
            </span>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-xs ${activeCat === 'watch' ? 'text-white/70' : 'text-[#737373]'}`}>
              {counts.watch}
            </span>
          </Link>
          <Link href="/read" className={`items-center flex justify-between py-4 px-6 transition-colors cursor-pointer text-left ${activeCat === 'read' ? 'bg-traced-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-semibold text-sm text-left ${activeCat === 'read' ? 'text-white' : 'text-traced-dark'}`}>
              Read
            </span>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-xs ${activeCat === 'read' ? 'text-white/70' : 'text-[#737373]'}`}>
              {counts.read}
            </span>
          </Link>
        </div>

        {/* Search Action */}
        <div className="flex flex-col border-b-hairline">
          <button 
            onClick={open}
            className="items-center flex py-4 px-6 gap-3 hover:bg-black/5 transition-colors w-full cursor-pointer group"
          >
            <Search size={16} className="text-[#737373] group-hover:text-traced-dark transition-colors" strokeWidth={2} />
            <span className="tracking-[0.05em] uppercase text-[#737373] group-hover:text-traced-dark font-sans font-medium text-sm transition-colors">
              Search Archive
            </span>
            <kbd className="ml-auto inline-flex items-center py-0.5 px-1.5 border-hairline tracking-[0.05em] uppercase text-[#737373]/50 font-sans font-medium text-[9px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col mt-auto">
          {session ? (
            <div className="flex flex-col border-t-hairline bg-traced-surface/30">
              <div className="px-6 py-4 flex items-center gap-3">
                <div className="size-8 rounded-full bg-traced-dark flex items-center justify-center text-traced-bg">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-traced-dark truncate max-w-[150px]">
                    {session.user?.name}
                  </span>
                  <span className="text-[9px] font-serif italic text-traced-gray">Archivist</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="ml-auto p-2 hover:text-traced-accent transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login"
              className="items-center flex justify-between py-4 px-6 border-t-hairline hover:bg-black/5 transition-colors w-full cursor-pointer text-left"
            >
              <span className="tracking-[0.05em] uppercase text-traced-dark font-sans font-medium text-[13px]">
                Sign In
              </span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
