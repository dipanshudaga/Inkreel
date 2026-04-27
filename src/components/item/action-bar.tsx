"use client";

import { useState } from "react";
import { Plus, Eye, Heart, Loader2, Check, Bookmark } from "lucide-react";
import { saveMediaAction } from "@/lib/actions/media";
import { useRouter } from "next/navigation";
import { useLogModal } from "@/hooks/use-log-modal";

type ActionState = "watched" | "watchlist" | "love" | null;

interface ActionBarProps {
  initialStatus?: string | null;
  initialRating?: number | null;
  mediaId: string;
  isExternal?: boolean;
  variant?: "default" | "compact";
  item?: any; // Full item data for the log modal
}

export function ActionBar({ 
  initialStatus, 
  initialRating, 
  mediaId, 
  isExternal: initialIsExternal,
  variant = "default",
  item
}: ActionBarProps) {
  const router = useRouter();
  const logModal = useLogModal();
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
    if (active === action) return;
    
    setLoading(action);
    try {
      if (isExternal) {
        const res = await saveMediaAction(mediaId, action || "watchlist", action === "love" ? 5 : null);
        if (res.success) {
          setActive(action);
          setIsExternal(false);
          router.refresh();
          if (res.id) router.push(`/items/${res.id}`);
        }
      } else {
        setActive(action);
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleLog = () => {
    if (!item) return;
    logModal.onOpen({
      id: item.id || mediaId,
      title: item.title,
      category: item.category || (item.type === 'movie' || item.type === 'tv' ? 'watch' : 'read'),
      type: item.type,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      year: item.releaseYear || item.year,
      creator: item.creator,
      description: item.description,
      genres: Array.isArray(item.genres) ? item.genres : item.genres?.split(", "),
      runtime: item.runtime,
      externalId: item.externalId || mediaId,
    });
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-6">
          {/* Watched */}
          <button
            onClick={() => handleAction("watched")}
            disabled={!!loading}
            title="Mark as Watched"
            className={`flex flex-col items-center gap-1.5 group transition-all ${active === 'watched' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'} disabled:opacity-50 cursor-pointer`}
          >
            <div className={`p-2 border border-black/10 transition-colors ${active === 'watched' ? 'bg-black text-white border-black' : 'bg-transparent'}`}>
              {loading === "watched" ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">Watched</span>
          </button>

          {/* Watchlist */}
          <button
            onClick={() => handleAction("watchlist")}
            disabled={!!loading}
            title="Add to Watchlist"
            className={`flex flex-col items-center gap-1.5 group transition-all ${active === 'watchlist' ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'} disabled:opacity-50 cursor-pointer`}
          >
            <div className={`p-2 border border-black/10 transition-colors ${active === 'watchlist' ? 'bg-black text-white border-black' : 'bg-transparent'}`}>
              {loading === "watchlist" ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={20} strokeWidth={2.5} />}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">Watchlist</span>
          </button>

          {/* Love */}
          <button
            onClick={() => handleAction("love")}
            disabled={!!loading}
            title="Favorite"
            className={`flex flex-col items-center gap-1.5 group transition-all ${active === 'love' ? 'opacity-100 scale-110 text-traced-accent' : 'opacity-50 hover:opacity-80'} disabled:opacity-50 cursor-pointer`}
          >
            <div className={`p-2 border border-black/10 transition-colors ${active === 'love' ? 'bg-traced-accent text-white border-traced-accent' : 'bg-transparent'}`}>
              {loading === "love" ? <Loader2 size={18} className="animate-spin" /> : <Heart size={20} strokeWidth={2.5} fill={active === 'love' ? "currentColor" : "none"} />}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">Love</span>
          </button>
        </div>

        <button 
          onClick={handleLog}
          className="h-10 px-8 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-traced-accent transition-colors cursor-pointer border border-black"
        >
          Log Entry
        </button>
      </div>
    );
  }

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
        <span className="uppercase tracking-[0.2em] text-[#737373] font-sans font-bold text-[9px]">Watchlist</span>
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
