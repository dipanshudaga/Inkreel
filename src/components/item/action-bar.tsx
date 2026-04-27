"use client";

import { useState } from "react";
import { Plus, Eye, Heart, Loader2 } from "lucide-react";
import { saveMediaAction } from "@/lib/actions/media";
import { useRouter } from "next/navigation";

type ActionState = "watched" | "watchlist" | "love" | null;

interface ActionBarProps {
  initialStatus?: string | null;
  initialRating?: number | null;
  mediaId: string;
  isExternal?: boolean;
}

export function ActionBar({ initialStatus, initialRating, mediaId, isExternal: initialIsExternal }: ActionBarProps) {
  const router = useRouter();
  const [isExternal, setIsExternal] = useState(initialIsExternal);
  const [loading, setLoading] = useState<ActionState>(null);

  const getInitialState = (): ActionState => {
    if (initialStatus === "completed") return "watched";
    if (initialStatus === "plan_to_watch" || initialStatus === "plan_to_read") return "watchlist";
    if (initialRating && initialRating >= 4.5) return "love";
    return null;
  };

  const [active, setActive] = useState<ActionState>(initialIsExternal ? null : getInitialState());

  const handleAction = async (action: ActionState) => {
    if (active === action) return; // Already in this state
    
    setLoading(action);
    try {
      if (isExternal) {
        // Save to DB
        const res = await saveMediaAction(mediaId, action || "watchlist", action === "love" ? 5 : null);
        if (res.success) {
          setActive(action);
          setIsExternal(false);
          router.refresh();
          // Optional: redirect to the new internal ID page
          if (res.id) router.push(`/items/${res.id}`);
        }
      } else {
        // TODO: Update existing item logic
        setActive(action);
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Watched */}
      <button
        onClick={() => handleAction("watched")}
        disabled={!!loading}
        className="flex flex-col items-center gap-3 group cursor-pointer disabled:opacity-50"
      >
        <div className={`size-14 border border-[#1A1A1A] flex items-center justify-center transition-all duration-300 ${
          active === "watched"
            ? "bg-traced-dark border-traced-dark text-white scale-110"
            : "bg-white hover:bg-traced-surface text-[#737373]"
        }`}>
          {loading === "watched" ? <Loader2 size={20} className="animate-spin" /> : <Eye size={22} strokeWidth={2} />}
        </div>
        <span className="uppercase tracking-[0.2em] text-[#737373] font-sans font-bold text-[9px]">Watched</span>
      </button>

      {/* Watchlist */}
      <button
        onClick={() => handleAction("watchlist")}
        disabled={!!loading}
        className="flex flex-col items-center gap-3 group cursor-pointer disabled:opacity-50"
      >
        <div className={`size-14 border border-[#1A1A1A] flex items-center justify-center transition-all duration-300 ${
          active === "watchlist"
            ? "bg-traced-dark border-traced-dark text-white scale-110"
            : "bg-white hover:bg-traced-surface text-[#737373]"
        }`}>
          {loading === "watchlist" ? <Loader2 size={20} className="animate-spin" /> : <Plus size={22} strokeWidth={2.5} />}
        </div>
        <span className="uppercase tracking-[0.2em] text-[#737373] font-sans font-bold text-[9px]">Archive</span>
      </button>

      {/* Love */}
      <button
        onClick={() => handleAction("love")}
        disabled={!!loading}
        className="flex flex-col items-center gap-3 group cursor-pointer disabled:opacity-50"
      >
        <div className={`size-14 border border-[#1A1A1A] flex items-center justify-center transition-all duration-300 ${
          active === "love"
            ? "bg-traced-accent border-traced-accent text-white scale-110"
            : "bg-white hover:bg-traced-surface text-[#737373]"
        }`}>
          {loading === "love" ? <Loader2 size={20} className="animate-spin" /> : <Heart size={22} strokeWidth={2} fill={active === "love" ? "currentColor" : "none"} />}
        </div>
        <span className="uppercase tracking-[0.2em] text-[#737373] font-sans font-bold text-[9px]">Love</span>
      </button>
    </div>
  );
}
