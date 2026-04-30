"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MediaCardProps {
  title: string;
  category: "watch" | "read" | "play";
  posterUrl: string;
  rating: number; // Keeping this for compatibility although not shown in the exact poster grid mockup
  slug: string;
  year: number;
  type?: string;
  description?: string; // Additional prop for compatibility
  subtitle?: string; // New prop specifically for what to show below title (e.g. "2024 · Movie" or "2019 · 1-5 players" or author)
  className?: string;
  href?: string;
}

export function MediaCard({
  title,
  category,
  posterUrl,
  slug,
  year,
  type,
  subtitle,
  className,
  href,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const targetHref = href || `/${category}/${slug}`;
 
  // Use aspect-square for games
  const isSquare = category === "play";
  const aspectClass = isSquare ? "aspect-[1/1]" : "aspect-[2/3]";
 
  // Fallback styling if image fails
  const fallbackBgClass = 
    category === "watch" ? "bg-[#EDE6D8]" : 
    category === "read" ? "bg-[#EBE4D6]" : "bg-[#D5DDE5]";
 
  // Format type (e.g. "board_game" -> "Board Game")
  const formattedType = type 
    ? type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : category.charAt(0).toUpperCase() + category.slice(1);

  // Fallback subtitle string
  const displaySubtitle = subtitle || `${year} · ${formattedType}`;

  return (
    <Link 
      href={targetHref}
      className={cn("flex flex-col gap-2 group cursor-pointer max-w-[240px]", className)}
    >
      <div 
        className={cn(
          "w-full rounded-[16px] overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]", 
          aspectClass,
          fallbackBgClass
        )}
      >
        {!imageError && posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title} 
            className="w-full h-full object-cover" 
            onError={() => setImageError(true)}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5 mt-1.5">
        <span className="font-medium text-[14px] text-vault-dark leading-tight truncate">
          {title}
        </span>
        <span className="font-medium text-[12px] text-[#8A8A7A] truncate">
          {displaySubtitle}
        </span>
      </div>
    </Link>
  );
}
