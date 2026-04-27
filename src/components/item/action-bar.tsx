"use client";

import { useState } from "react";
import { Plus, Eye, Heart } from "lucide-react";

type ActionState = "watched" | "watchlist" | "love" | null;

interface ActionBarProps {
  initialStatus?: string | null;
  initialRating?: number | null;
  mediaId: string;
  isExternal?: boolean;
}

export function ActionBar({ initialStatus, initialRating, isExternal }: ActionBarProps) {
  const getInitialState = (): ActionState => {
    if (initialStatus === "completed") return "watched";
    if (initialStatus === "plan_to_watch" || initialStatus === "plan_to_read") return "watchlist";
    if (initialRating && initialRating >= 4.5) return "love";
    return null;
  };

  const [active, setActive] = useState<ActionState>(isExternal ? null : getInitialState());

  const toggle = (action: ActionState) => {
    // Clicking the same active button deactivates it
    setActive(prev => (prev === action ? null : action));
  };

  return (
    <div className="py-12 px-16 border-b-hairline flex items-center gap-16">
      {/* Watched */}
      <button
        onClick={() => toggle("watched")}
        className="flex flex-col items-center gap-3 group cursor-pointer"
      >
        <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all duration-200 ${
          active === "watched"
            ? "bg-traced-dark border-traced-dark text-white scale-110"
            : "bg-white hover:border-traced-dark text-[#737373]"
        }`}>
          <Eye size={22} strokeWidth={2} />
        </div>
        <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Watched</span>
      </button>

      {/* Watchlist */}
      <button
        onClick={() => toggle("watchlist")}
        className="flex flex-col items-center gap-3 group cursor-pointer"
      >
        <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all duration-200 ${
          active === "watchlist"
            ? "bg-traced-dark border-traced-dark text-white scale-110"
            : "bg-white hover:border-traced-dark text-[#737373]"
        }`}>
          <Plus size={22} strokeWidth={2.5} />
        </div>
        <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Watchlist</span>
      </button>

      {/* Love */}
      <button
        onClick={() => toggle("love")}
        className="flex flex-col items-center gap-3 group cursor-pointer"
      >
        <div className={`size-14 rounded-full border-hairline flex items-center justify-center transition-all duration-200 ${
          active === "love"
            ? "bg-[#EF4444] border-[#EF4444] text-white scale-110"
            : "bg-white hover:border-[#EF4444] text-[#737373]"
        }`}>
          <Heart size={22} strokeWidth={2} fill={active === "love" ? "currentColor" : "none"} />
        </div>
        <span className="uppercase tracking-[0.1em] text-[#737373] font-sans font-bold text-[10px]">Love</span>
      </button>
    </div>
  );
}
