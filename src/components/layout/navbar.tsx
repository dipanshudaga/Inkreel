"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SearchOverlay } from "@/components/ui/search-overlay";
import { LogModal } from "@/components/ui/log-modal";
import { useLogModal } from "@/hooks/use-log-modal";

const navItems = [
  { name: "Watch", href: "/watch" },
  { name: "Read", href: "/read" },
  { name: "Play", href: "/play" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const onOpenLog = useLogModal((state) => state.onOpen);

  const currentCategory = pathname.split("/")[1] as "watch" | "read" | "play" | undefined;

  return (
    <header className="w-full relative z-[100] bg-vault-bg">
      <div className="flex items-center justify-between py-5 px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <Link href="/" className="[letter-spacing:-1px] inline-block text-vault-dark font-extrabold text-[24px]">
          Content Vault
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-block font-semibold text-[18px]",
                  isActive ? "text-vault-dark" : "text-vault-gray hover:text-vault-dark transition-colors"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex-shrink-0 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C2E2C" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button 
            onClick={() => onOpenLog()}
            className="rounded-full py-2.5 px-6 bg-[#2C2E2C] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="text-[#FBF8F0] font-bold text-sm">
              Log
            </div>
          </button>
        </div>
      </div>
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        defaultCategory={currentCategory} 
      />
      <LogModal />
    </header>
  );
}
