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
  
  const [isExternal, setIsExternal] = useState(
    initialIsExternal ?? !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mediaId)
  );
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

      // 1. Instant Optimistic Update for immediate feedback
      updateStoreItem(mediaId, nextStatus, category);

      if (isExternal) {
        setLoading(action);
        // 2. Perform save in background
        const res = await saveMediaAction({ 
          ...item, 
          id: mediaId, 
          status: nextStatus || "watchlist" 
        });

        if (res.success && res.id) {
          // Sync store with the new UUID
          updateStoreItem(res.id, nextStatus, category);
          setIsExternal(false);
          
          // 3. Only redirect if we're on the specific item's detail page
          // This avoids jarring navigation if clicking from the dashboard
          if (typeof window !== "undefined" && window.location.pathname.includes(encodeURIComponent(mediaId))) {
            router.push(`/items/${res.id}`);
          }
        }
        setLoading(null);
      } else {
        // Background sync for existing items
        updateMediaAction(mediaId, nextStatus || "none").then(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Action failed:", err);
      // Rollback on error
      updateStoreItem(mediaId, status, null);
      setLoading(null);
    }
  };

  const isRead = item?.category === 'read' || item?.type === 'book' || item?.type === 'manga';

  const Button = ({ action, active, icon: Icon, label, color = "dark" }: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleAction(action);
      }}
      className={cn(
        "flex flex-col items-center gap-2 group transition-all cursor-pointer",
        active ? "opacity-100" : "opacity-30 hover:opacity-100",
        active && color === "accent" && "text-accent"
      )}
    >
      <div className={cn(
        "size-14 flex items-center justify-center border border-dark/10 transition-all duration-300",
        active 
          ? (color === "accent" ? "bg-accent text-white border-accent shadow-lg scale-105" : "bg-dark text-white border-dark scale-105") 
          : "bg-transparent hover:border-dark"
      )}>
        {loading === action ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Icon size={22} strokeWidth={active ? 2.5 : 2} fill={active && action === "loved" ? "currentColor" : "none"} />
        )}
      </div>
      <span className="text-[8px] font-medium uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  if (variant === "grid") {
    return (
      <div className="flex border-x-hairline border-b-hairline divide-hairline h-11 bg-bg w-full">
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction("completed"); }}
          className={cn("flex-1 flex items-center justify-center transition-colors", isCompleted ? "bg-dark text-white" : "text-dark hover:bg-dark/10")}
        >
          {loading === "completed" ? <Loader2 size={16} className="animate-spin" /> : (isRead ? <Check size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />)}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction("planned"); }}
          className={cn("flex-1 flex items-center justify-center transition-colors", isPlanned ? "bg-dark text-white" : "text-dark hover:bg-dark/10")}
        >
          {loading === "planned" ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={18} strokeWidth={2} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction("loved"); }}
          className={cn("flex-1 flex items-center justify-center transition-colors", isLoved ? "bg-accent text-white" : "text-dark hover:bg-dark/10")}
        >
          {loading === "loved" ? <Loader2 size={16} className="animate-spin" /> : <Heart size={18} strokeWidth={2} fill={isLoved ? "currentColor" : "none"} />}
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
