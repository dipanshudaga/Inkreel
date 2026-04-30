"use client";

import { useState } from "react";
import { updateGoalsAction } from "@/lib/actions/user-settings";
import { Loader2, Check, Target, Film, Book } from "lucide-react";
import { cn } from "@/lib/utils";

export function GoalsForm({ 
  currentMovieGoal, 
  currentBookGoal,
  completedMovies,
  completedBooks
}: { 
  currentMovieGoal: number, 
  currentBookGoal: number,
  completedMovies: number,
  completedBooks: number
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateGoalsAction(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-12">
      <div className="flex flex-col gap-12">
        {/* Movies */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.1em] font-medium opacity-40">Cinematics Goal</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif italic">{completedMovies}</span>
                <span className="text-2xl opacity-40 font-serif italic mx-1">/</span>
                <input
                  type="number"
                  name="movieGoal"
                  defaultValue={currentMovieGoal}
                  className="w-20 bg-transparent border-b border-hairline/20 py-1 text-2xl font-serif italic focus:outline-none focus:border-accent transition-all text-center"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="h-5 w-full bg-dark/5 overflow-hidden">
            <div 
              className="h-full bg-dark transition-all duration-1000" 
              style={{ width: `${Math.min(100, (completedMovies / (currentMovieGoal || 1)) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Books */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.1em] font-medium opacity-40">Literary Goal</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif italic">{completedBooks}</span>
                <span className="text-2xl opacity-40 font-serif italic mx-1">/</span>
                <input
                  type="number"
                  name="bookGoal"
                  defaultValue={currentBookGoal}
                  className="w-20 bg-transparent border-b border-hairline/20 py-1 text-2xl font-serif italic focus:outline-none focus:border-accent transition-all text-center"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="h-5 w-full bg-dark/5 overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-1000" 
              style={{ width: `${Math.min(100, (completedBooks / (currentBookGoal || 1)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-fit px-8 py-3 font-sans text-[10px] uppercase tracking-[0.3em] font-bold border-hairline transition-all duration-500 flex items-center justify-center gap-2",
          success 
            ? "bg-green-500 text-white border-green-500" 
            : "bg-transparent text-dark hover:bg-dark hover:text-white"
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : success ? (
          <>
            <Check size={14} />
            Goals Saved
          </>
        ) : (
          "Save Objectives"
        )}
      </button>

      {error && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 font-medium">
          {error}
        </p>
      )}
    </form>
  );
}
