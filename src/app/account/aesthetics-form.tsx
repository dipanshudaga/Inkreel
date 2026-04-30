"use client";

import { useState } from "react";
import { updateAestheticsAction } from "@/lib/actions/user-settings";
import { Loader2, Check, Palette, Type } from "lucide-react";
import { cn } from "@/lib/utils";

export function AestheticsForm({ currentTheme, currentFont }: { currentTheme: string, currentFont: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateAestheticsAction(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40 px-1 flex items-center gap-2">
          <Palette size={12} /> Paper Grade (Theme)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="cursor-pointer group">
            <input 
              type="radio" 
              name="theme" 
              value="cream" 
              defaultChecked={currentTheme === "cream"}
              className="peer hidden" 
            />
            <div className="border border-hairline p-6 flex flex-col gap-3 bg-surface peer-checked:bg-dark peer-checked:text-white transition-all">
              <span className="text-sm font-serif italic">Cream Heritage</span>
              <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 peer-checked:opacity-100">Classic Editorial</span>
            </div>
          </label>
          <label className="cursor-pointer group">
            <input 
              type="radio" 
              name="theme" 
              value="modern" 
              defaultChecked={currentTheme === "modern"}
              className="peer hidden" 
            />
            <div className="border border-hairline p-6 flex flex-col gap-3 bg-white peer-checked:bg-dark peer-checked:text-white transition-all">
              <span className="text-sm font-sans">Modern Studio</span>
              <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 peer-checked:opacity-100">High Contrast</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-40 px-1 flex items-center gap-2">
          <Type size={12} /> Typography Focus
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="cursor-pointer group">
            <input 
              type="radio" 
              name="fontPreference" 
              value="serif" 
              defaultChecked={currentFont === "serif"}
              className="peer hidden" 
            />
            <div className="border border-hairline p-6 flex flex-col gap-3 bg-surface/50 peer-checked:bg-dark peer-checked:text-white transition-all">
              <span className="text-sm font-serif italic">Serif First</span>
              <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 peer-checked:opacity-100">Narrative Style</span>
            </div>
          </label>
          <label className="cursor-pointer group">
            <input 
              type="radio" 
              name="fontPreference" 
              value="sans" 
              defaultChecked={currentFont === "sans"}
              className="peer hidden" 
            />
            <div className="border border-hairline p-6 flex flex-col gap-3 bg-surface/50 peer-checked:bg-dark peer-checked:text-white transition-all">
              <span className="text-sm font-sans">Sans First</span>
              <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100 peer-checked:opacity-100">Clean Interface</span>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-4 font-sans text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-500 flex items-center justify-center gap-2",
          success 
            ? "bg-green-500 text-white" 
            : "bg-dark text-white hover:bg-accent"
        )}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : success ? (
          <>
            <Check size={16} />
            Aesthetics Applied
          </>
        ) : (
          "Save Aesthetics"
        )}
      </button>

      {error && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 text-center font-medium">
          {error}
        </p>
      )}
    </form>
  );
}
