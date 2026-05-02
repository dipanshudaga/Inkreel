"use client";

import { useLogModal } from "@/hooks/use-log-modal";
import { X } from "lucide-react";
import { useEffect } from "react";

export function LogModal() {
  const { isOpen, onClose, media } = useLogModal();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-dark/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg border-hairline shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-hairline">
          <h2 className="text-xl font-serif font-medium text-dark">
            {media ? `Log ${media.title}` : "Quick Log"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col gap-6">
          <p className="text-gray font-sans text-sm italic">
            Logging functionality is being refined. Check back soon.
          </p>
        </div>

        <div className="flex justify-end p-4 bg-surface border-t-hairline">
          <button 
            onClick={onClose}
            className="py-2 px-6 bg-dark text-white font-sans font-medium text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
