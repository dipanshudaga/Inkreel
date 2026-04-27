"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { StarRating } from "./star-rating";
import { logMediaAction } from "@/lib/actions/log";
import { useRouter } from "next/navigation";
import { useLogModal } from "@/hooks/use-log-modal";

export function LogModal() {
  const { isOpen, onClose, media: initialMedia } = useLogModal();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [progress, setProgress] = useState("");
  
  // Specific toggles from paper F7-1
  const [liked, setLiked] = useState(false);
  const [rewatch, setRewatch] = useState(false);
  const [spoilers, setSpoilers] = useState(false);

  const handleSave = async () => {
    if (!initialMedia) return;
    setIsSubmitting(true);
    try {
      await logMediaAction({
        mediaData: {
          title: initialMedia.title,
          category: initialMedia.category,
          subType: initialMedia.subType || (initialMedia.category === "watch" ? "movie" : initialMedia.category === "read" ? "book" : "board_game"),
          posterUrl: initialMedia.posterUrl,
          backdropUrl: initialMedia.backdropUrl,
          year: initialMedia.year || 2024,
          creator: initialMedia.creator || "Unknown",
          slug: initialMedia.id,
          description: initialMedia.description,
          genres: initialMedia.genres,
          runtime: initialMedia.runtime || (initialMedia as any).duration,
          pageCount: initialMedia.pageCount,
          externalId: initialMedia.externalId,
        },
        logData: {
          rating,
          isLiked: liked,
          reviewText: review,
          progress: progress ? parseInt(progress) : undefined,
          loggedDate: new Date().toISOString().split("T")[0],
        }
      });
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-traced-dark/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div 
        className="flex bg-traced-bg flex-col w-full max-w-[540px] border-hairline mx-auto shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-traced-dark hover:text-traced-accent transition-colors cursor-pointer z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col">
          {/* Header */}
          <div className="p-10 border-b-hairline bg-white">
            <h2 className="font-serif italic text-4xl text-traced-dark leading-none">
              {initialMedia ? "Log Entry" : "New Entry"}
            </h2>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#737373] font-bold mt-4">
              Recording to your personal archive
            </p>
          </div>
          
          {initialMedia ? (
            <div className="flex flex-col">
              {/* Media Preview Section */}
              <div className="flex items-center gap-8 p-10 bg-traced-surface/30">
                <div className="h-32 w-24 shrink-0 bg-traced-surface border-hairline overflow-hidden shadow-sm">
                  {initialMedia.posterUrl ? (
                    <img src={initialMedia.posterUrl} alt={initialMedia.title} className="object-cover h-full w-full grayscale-25" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-[8px] uppercase tracking-tighter text-[#A3A3A3]">No Image</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-serif font-medium text-traced-dark leading-tight">
                    {initialMedia.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-sans font-bold text-traced-accent uppercase tracking-widest">
                      {initialMedia.subType || initialMedia.category}
                    </span>
                    <div className="h-px w-4 bg-[#D4D4D4]" />
                    <span className="text-[11px] font-sans text-[#737373] uppercase tracking-widest font-bold">
                      {initialMedia.year || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-10 flex flex-col gap-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="flex flex-col gap-4">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#737373]">
                      Logged On
                    </label>
                    <div className="font-serif italic text-xl text-traced-dark border-b-hairline pb-2">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#737373]">
                      Rating
                    </label>
                    <div className="flex items-center gap-4 border-b-hairline pb-2">
                      <StarRating value={rating} interactive size="md" onChange={setRating} />
                      <span className="font-serif italic text-xl text-traced-dark">{rating || 0}</span>
                    </div>
                  </div>
                </div>

                {initialMedia.category === "read" && (
                  <div className="flex flex-col gap-4">
                    <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#737373]">
                      Reading Progress
                    </label>
                    <div className="flex items-center gap-4 border-b-hairline pb-2">
                      <input 
                        type="number" 
                        placeholder="Current Page"
                        className="bg-transparent text-xl font-serif text-traced-dark outline-none w-full italic"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                      />
                      <span className="text-sm font-sans text-[#737373] font-bold uppercase tracking-widest shrink-0">
                        / {initialMedia.pageCount || "?"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <label className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#737373]">
                    Archive Notes
                  </label>
                  <textarea 
                    rows={3}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Your reflections..."
                    className="bg-white border-hairline p-6 text-lg font-serif text-traced-dark outline-none resize-none placeholder:text-[#A3A3A3] placeholder:italic"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setLiked(!liked)} 
                    className={cn(
                      "flex-1 border-hairline py-3 px-6 text-[11px] font-sans font-black uppercase tracking-[0.2em] transition-all cursor-pointer",
                      liked ? "bg-traced-accent text-white" : "bg-white text-traced-dark hover:bg-traced-surface"
                    )}
                  >
                    {liked ? "♥ Favorited" : "Favorite"}
                  </button>
                  <button 
                    onClick={() => setRewatch(!rewatch)} 
                    className={cn(
                      "flex-1 border-hairline py-3 px-6 text-[11px] font-sans font-black uppercase tracking-[0.2em] transition-all cursor-pointer",
                      rewatch ? "bg-traced-dark text-white" : "bg-white text-traced-dark hover:bg-traced-surface"
                    )}
                  >
                    {initialMedia.category === "read" ? "Reread" : "Rewatch"}
                  </button>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-traced-dark text-white font-sans font-black text-[13px] uppercase tracking-[0.3em] py-6 hover:bg-traced-accent transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    "Commit to Archive"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <p className="font-serif italic text-2xl text-[#737373]">
                The archive awaits your next discovery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
