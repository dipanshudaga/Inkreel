"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { addToArchive } from "@/lib/actions/media";
import { useRouter } from "next/navigation";

interface AddToArchiveButtonProps {
  item: any;
}

export function AddToArchiveButton({ item }: AddToArchiveButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    setIsPending(true);
    const result = await addToArchive(item);
    if (result.success) {
      setIsSuccess(true);
      router.refresh();
    } else {
      alert(result.error || "Something went wrong");
    }
    setIsPending(false);
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-[#EFEEE8] border border-[#1A1A1A] text-traced-dark font-sans text-sm font-semibold uppercase tracking-wider">
        <Check size={18} />
        In Archive
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className="flex items-center gap-2 px-8 py-4 bg-traced-dark text-white hover:bg-traced-accent transition-colors font-sans text-sm font-semibold uppercase tracking-widest disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Plus size={18} />
      )}
      Add to Archive
    </button>
  );
}
