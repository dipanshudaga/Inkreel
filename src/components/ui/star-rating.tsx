"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, max = 10, size = 16, className }: StarRatingProps) {
  // Simple conversion to 5 stars if max is 10, or just show the number
  const displayRating = max === 10 ? rating / 2 : rating;
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "shrink-0",
            i < Math.floor(displayRating) 
              ? "fill-accent text-accent" 
              : i < displayRating 
                ? "fill-accent/50 text-accent" 
                : "text-gray/20"
          )}
        />
      ))}
      <span className="ml-2 font-sans text-sm font-medium text-dark/60">
        {rating}/{max}
      </span>
    </div>
  );
}
