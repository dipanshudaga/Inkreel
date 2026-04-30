"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grow flex flex-col items-center justify-center min-h-[60vh] bg-bg">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="size-16 border-hairline flex items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 text-accent animate-spin" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-serif font-medium italic text-dark">
            Processing.
          </h2>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#737373] font-sans font-medium">
            Gathering data from the archive
          </p>
        </div>
      </div>
    </div>
  );
}
