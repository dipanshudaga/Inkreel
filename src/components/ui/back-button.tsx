"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-8 right-8 size-9 flex items-center justify-center border-hairline bg-white hover:bg-dark hover:text-white transition-colors cursor-pointer"
      aria-label="Go back"
    >
      <X size={16} strokeWidth={2} />
    </button>
  );
}
