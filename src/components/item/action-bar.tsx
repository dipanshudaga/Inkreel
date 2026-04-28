"use client";

import { useState } from "react";
import { Plus, Eye, Heart, Loader2, Check, Bookmark } from "lucide-react";
import { saveMediaAction, updateMediaAction } from "@/lib/actions/media";
import { useRouter } from "next/navigation";
import { useMediaStore } from "@/store/use-media-store";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface ActionBarProps {
  initialStatus?: string | null;
  mediaId: string;
  isExternal?: boolean;
  variant?: "default" | "compact" | "grid";
  item?: any;
}

export function ActionBar({ 
  initialStatus, 
  mediaId, 
  isExternal: initialIsExternal,
  variant = "default",
  item
}: ActionBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const storeItem = useMediaStore((state) => state.items[mediaId]);
  const updateStoreItem = useMediaStore((state) => state.updateItem);
  
  const [isExternal, setIsExternal] = useState(initialIsExternal);
  const [loading, setLoading] = useState<string | null>(null);

  // Use store value if available, otherwise fallback to prop
  const status = storeItem ? storeItem.status : initialStatus;

  const isCompleted = status === "completed" || status === "loved";
  const isPlanned = status === "watchlist" || status === "shelf";
  const isLoved = status === "loved";

  const handleAction = async (action: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (loading) return;
    setLoading(action);

    try {
      let nextStatus: string | null = null;
      const category = item?.category || (item?.type === 'book' || item?.type === 'manga' ? 'read' : 'watch');

      if (action === "completed") {
        nextStatus = isCompleted ? null : "completed";
      } else if (action === "planned") {
        nextStatus = isPlanned ? null : (category === "read" ? "shelf" : "watchlist");
      } else if (action === "loved") {
        nextStatus = isLoved ? "completed" : "loved";
      }

      if (isExternal) {
        const res = await saveMediaAction(mediaId, nextStatus || "watchlist");
        if (res.success) {
          if (res.id) {
            updateStoreItem(res.id, nextStatus, null);
          }
          setIsExternal(false);
          router.refresh();
          if (res.id) router.push(`/items/${res.id}`);
        }
      } else {
        // Optimistic Update
        updateStoreItem(mediaId, nextStatus, null);
        await updateMediaAction(mediaId, nextStatus || "none");
        router.refresh();
      }
    } catch (err) {
      console.error("Action failed:", err);
      updateStoreItem(mediaId, initialStatus, null);
    } finally {
      setLoading(null);
    }
  };

  const isRead = item?.category === 'read' || item?.type === 'book' || item?.type === 'manga';

  const Button = ({ action, active, icon: Icon, label, color = "dark" }: any) => (
    <button
      onClick={() => handleAction(action)}
      disabled={!!loading}
      className={cn(
        "flex flex-col items-center gap-2 group transition-all disabled:opacity-50 cursor-pointer",
        active ? "opacity-100" : "opacity-30 hover:opacity-100",
        active && color === "accent" && "text-traced-accent"
      )}
    >
      <div className={cn(
        "size-14 flex items-center justify-center border border-black/10 transition-all duration-300",
        active 
          ? (color === "accent" ? "bg-traced-accent text-white border-traced-accent" : "bg-black text-white border-black") 
          : "bg-transparent hover:border-black"
      )}>
        {loading === action ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Icon size={22} strokeWidth={active ? 2.5 : 2} fill={active && action === "loved" ? "currentColor" : "none"} />
        )}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  if (variant === "grid") {
    return (
      <div className="flex border-hairline border-t-0 divide-x divide-traced-dark h-9 bg-traced-bg w-full">
        <button
          onClick={() => handleAction("completed")}
          className={cn("flex-1 flex items-center justify-center transition-colors", isCompleted ? "bg-black text-white" : "text-traced-gray hover:bg-black/5")}
        >
          {loading === "completed" ? <Loader2 size={14} className="animate-spin" /> : (isRead ? <Check size={16} /> : <Eye size={16} />)}
        </button>
        <button
          onClick={() => handleAction("planned")}
          className={cn("flex-1 flex items-center justify-center transition-colors", isPlanned ? "bg-black text-white" : "text-traced-gray hover:bg-black/5")}
        >
          {loading === "planned" ? <Loader2 size={14} className="animate-spin" /> : <Bookmark size={16} />}
        </button>
        <button
          onClick={() => handleAction("loved")}
          className={cn("flex-1 flex items-center justify-center transition-colors", isLoved ? "bg-traced-accent text-white" : "text-traced-gray hover:bg-black/5")}
        >
          {loading === "loved" ? <Loader2 size={14} className="animate-spin" /> : <Heart size={16} fill={isLoved ? "currentColor" : "none"} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-8 w-full">
      <Button 
        action="completed" 
        active={isCompleted} 
        icon={isRead ? Check : Eye} 
        label={isRead ? "Read" : "Watched"} 
      />
      <Button 
        action="planned" 
        active={isPlanned} 
        icon={Bookmark} 
        label={isRead ? "Shelf" : "Watchlist"} 
      />
      <Button 
        action="loved" 
        active={isLoved} 
        icon={Heart} 
        label="Love" 
        color="accent"
      />
    </div>
  );
}
