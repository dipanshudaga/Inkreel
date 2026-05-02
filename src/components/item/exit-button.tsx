"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExitButtonProps {
  href: string;
}

export function ExitButton({ href }: ExitButtonProps) {
  const router = useRouter();

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try to go back in history to preserve scroll position
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button 
      onClick={handleExit}
      className="fixed top-8 right-8 z-[100] size-12 flex items-center justify-center bg-black text-white hover:bg-accent transition-colors shadow-2xl cursor-pointer"
    >
      <X size={24} strokeWidth={2.5} />
    </button>
  );
}
