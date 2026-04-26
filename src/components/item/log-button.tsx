"use client";

import { Plus } from "lucide-react";
import { useQuickLogStore } from "@/store/use-quick-log-store";

interface LogButtonProps {
  mediaId: string;
  type: string;
}

export function LogButton({ mediaId, type }: LogButtonProps) {
  const { openQuickLog } = useQuickLogStore();
  
  const label = type === 'book' || type === 'manga' ? 'Read' : 'Watch';

  return (
    <button 
      onClick={() => openQuickLog(mediaId)}
      className="flex items-center gap-3 bg-traced-accent text-white px-10 h-14 font-sans text-sm font-semibold uppercase tracking-[0.1em] hover:bg-traced-accent/90 transition-all rounded-full shadow-[0_12px_24px_-8px_rgba(230,73,45,0.4)]"
    >
      <Plus size={20} strokeWidth={3} />
      Log {label}
    </button>
  );
}
