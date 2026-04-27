"use client";

import { Plus } from "lucide-react";
import { useLogModal } from "@/hooks/use-log-modal";

export function DetailLogButton({ media }: { media: any }) {
  const onOpen = useLogModal((state) => state.onOpen);

  return (
    <button 
      onClick={() => onOpen(media)}
      className="btn-primary flex items-center gap-2 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      Log Entry
    </button>
  );
}
