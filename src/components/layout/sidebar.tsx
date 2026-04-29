"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchParams, usePathname } from "next/navigation";
import { useSearchStore } from "@/store/use-search-store";
import { useMediaStore } from "@/store/use-media-store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getUserMediaAction } from "@/lib/actions/media";

export function Sidebar() {
  const { open } = useSearchStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storeItems = useMediaStore((state) => state.items);
  const setItems = useMediaStore((state) => state.setItems);

  // Sync store from server on mount
  useEffect(() => {
    if (session) {
      getUserMediaAction().then(res => {
        if (res.success) setItems(res.items);
      });
    }
  }, [session, setItems]);

  // Reactive counts from the store
  const counts = useMemo(() => {
    const values = Object.values(storeItems);
    return {
      watch: values.filter(v => v.category === 'watch' && v.status && v.status !== "none").length,
      read: values.filter(v => v.category === 'read' && v.status && v.status !== "none").length
    };
  }, [storeItems]);

  const activeCat = searchParams.get('cat') || (pathname.startsWith('/watch') ? 'watch' : pathname.startsWith('/read') ? 'read' : null);

  return (
    <aside className="flex flex-col shrink-0 h-full w-[288px] border-r-hairline bg-traced-bg fixed top-0 left-0 z-50">
      {/* Balanced Header: Logo */}
      <div className="flex items-center justify-between py-10 px-6 border-b-hairline bg-white/50">
        <Link href="/" className="tracking-[-0.02em] text-traced-dark font-serif font-medium italic text-4xl">
          Inkreel.
        </Link>
      </div>

      <div className="flex flex-col grow overflow-y-auto">
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
              Search
            </span>
            <kbd className="ml-auto inline-flex items-center py-0.5 px-1.5 border-hairline tracking-[0.05em] uppercase text-[#737373]/50 font-sans font-medium text-[9px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Bottom Section: Import + Profile */}
        <div className="flex flex-col mt-auto">
          <Link href="/import" className={`items-center flex py-4 px-6 gap-3 transition-colors cursor-pointer group border-t-hairline border-b-hairline ${pathname === '/import' ? 'bg-traced-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-semibold text-sm ${pathname === '/import' ? 'text-white' : 'text-[#737373] group-hover:text-traced-dark'}`}>
              Import
            </span>
          </Link>

          {session && (
            <Link href="/account" className={`flex items-center gap-4 py-6 px-6 transition-colors cursor-pointer group border-b-hairline ${pathname === '/account' ? 'bg-traced-accent text-white' : 'hover:bg-black/5'}`}>
              <div className="size-8 rounded-full border border-black bg-white overflow-hidden shrink-0">
                <img 
                  src="/avatar.png" 
                  alt="Profile" 
                  className="size-full object-cover grayscale"
                />
              </div>
              <span className={`tracking-[0.05em] uppercase font-sans font-semibold text-xs truncate ${pathname === '/account' ? 'text-white' : 'text-[#737373] group-hover:text-traced-dark'}`}>
                {session.user.name?.charAt(0).toUpperCase() + session.user.name?.slice(1)}
              </span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
