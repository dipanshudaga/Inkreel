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
import { getCurrentUserAction } from "@/lib/actions/user-settings";

export function Sidebar() {
  const { open } = useSearchStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const storeItems = useMediaStore((state) => state.items);
  const setItems = useMediaStore((state) => state.setItems);
  const storeUser = useMediaStore((state) => state.user);
  const setUser = useMediaStore((state) => state.setUser);

  // Sync store from server on mount
  useEffect(() => {
    if (session) {
      getUserMediaAction().then(res => {
        if (res.success) setItems(res.items);
      });
      getCurrentUserAction().then(res => {
        if (res.success && res.user) {
          setUser({ name: res.user.name, username: res.user.username });
        }
      });
    }
  }, [session, setItems, setUser]);

  // Reactive counts from the store
  const counts = useMemo(() => {
    // Get unique items based on their internal ID to avoid double-counting 
    // items indexed by both UUID and External ID
    const uniqueItems = Array.from(
      new Map(
        Object.values(storeItems)
          .filter(v => v.id)
          .map(v => [v.id, v])
      ).values()
    );

    // Add items that only have an external ID (not yet saved)
    const externalItems = Object.values(storeItems).filter(v => !v.id);
    const allItems = [...uniqueItems, ...externalItems];

    return {
      watch: allItems.filter(v => v.category === 'watch' && v.status && v.status !== "none").length,
      read: allItems.filter(v => v.category === 'read' && v.status && v.status !== "none").length
    };
  }, [storeItems]);

  const activeCat = searchParams.get('cat') || (pathname.startsWith('/watch') ? 'watch' : pathname.startsWith('/read') ? 'read' : null);

  return (
    <aside className="flex flex-col shrink-0 h-full w-[288px] border-r-hairline bg-bg fixed top-0 left-0 z-50">
      {/* Balanced Header: Logo */}
      <div className="flex items-center justify-between py-10 px-6 border-b-hairline bg-surface/30">
        <Link href="/" className="tracking-[-0.02em] text-dark font-serif font-medium italic text-4xl">
          Inkreel.
        </Link>
      </div>

      <div className="flex flex-col grow overflow-y-auto">
        {/* Diaries Section */}
        <div className="flex flex-col border-b-hairline">
          <Link href="/watch" className={`items-center flex justify-between py-4 px-6 transition-colors cursor-pointer text-left ${activeCat === 'watch' ? 'bg-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-sm text-left ${activeCat === 'watch' ? 'text-white' : 'text-dark'}`}>
              Watch
            </span>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-xs ${activeCat === 'watch' ? 'text-white/70' : 'text-gray'}`}>
              {counts.watch}
            </span>
          </Link>
          <Link href="/read" className={`items-center flex justify-between py-4 px-6 transition-colors cursor-pointer text-left ${activeCat === 'read' ? 'bg-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-sm text-left ${activeCat === 'read' ? 'text-white' : 'text-dark'}`}>
              Read
            </span>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-xs ${activeCat === 'read' ? 'text-white/70' : 'text-gray'}`}>
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
            <Search size={16} className="text-gray group-hover:text-dark transition-colors" strokeWidth={2} />
            <span className="tracking-[0.05em] uppercase text-gray group-hover:text-dark font-sans font-medium text-sm transition-colors">
              Search
            </span>
            <kbd className="ml-auto inline-flex items-center py-1 px-2.5 border-hairline tracking-[0.05em] uppercase text-gray/80 font-sans font-bold text-[11px] bg-white shadow-sm gap-2">
              <span>⌘</span>
              <span>+</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Bottom Section: Import + Profile */}
        <div className="flex flex-col mt-auto">
          <Link href="/import" className={`items-center flex py-4 px-6 gap-3 transition-colors cursor-pointer group border-t-hairline border-b-hairline ${pathname === '/import' ? 'bg-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-sm ${pathname === '/import' ? 'text-white' : 'text-[#737373] group-hover:text-dark'}`}>
              Import
            </span>
          </Link>

          <Link href="/account" className={`items-center flex py-4 px-6 gap-3 transition-colors cursor-pointer group border-b-hairline ${pathname === '/account' ? 'bg-accent text-white' : 'hover:bg-black/5'}`}>
            <span className={`tracking-[0.05em] uppercase font-sans font-medium text-sm ${pathname === '/account' ? 'text-white' : 'text-[#737373] group-hover:text-dark'}`}>
              Account
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
