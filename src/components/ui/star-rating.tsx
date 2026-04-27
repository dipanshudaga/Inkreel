"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  value,
  max = 5,
  className,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const stars = [];
  for (let i = 1; i <= max; i++) {
    const isFull = i <= value;
    const isHalf = !isFull && i - 0.5 <= value;

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={cn(
          "transition-transform",
          interactive && "hover:scale-110 active:scale-95 cursor-pointer",
          !interactive && "cursor-default"
        )}
      >
        {isFull ? (
          <Star className={cn(sizeClasses[size], "fill-traced-accent text-traced-accent")} />
        ) : isHalf ? (
          <StarHalf className={cn(sizeClasses[size], "fill-traced-accent text-traced-accent")} />
        ) : (
          <Star className={cn(sizeClasses[size], "text-traced-surface fill-traced-surface")} />
        )}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars}
    </div>
  );
}
