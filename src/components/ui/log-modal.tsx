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
          subType: initialMedia.category === "watch" ? "movie" : initialMedia.category === "read" ? "book" : "board_game",
          posterUrl: initialMedia.posterUrl,
          year: 2024,
          creator: "Unknown",
          slug: initialMedia.id,
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
    <div className="fixed inset-0 z-[150] bg-[#2C2E2C99]">
      <div className="flex bg-[#FBF8F0] flex-col w-[500px] rounded-[32px] mx-auto mt-20 p-8 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-[#2C2E2C] hover:opacity-70 transition-opacity cursor-pointer flex shrink-0"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="[letter-spacing:-1px] text-[#2C2E2C] font-extrabold text-[24px]">
          {initialMedia ? "Log Entry" : "New Entry"}
        </div>
        
        {initialMedia ? (
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex items-center gap-4 border-b-[1.5px] border-[#2C2E2C1F] pb-6">
              <div className="h-[90px] w-[60px] overflow-hidden rounded bg-[#EDE6D8] shrink-0">
                <img src={initialMedia.posterUrl} alt={initialMedia.title} className="object-cover h-full w-full" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[20px] font-bold text-[#2C2E2C] leading-tight">
                  {initialMedia.title}
                </h3>
                <span className="text-[14px] font-medium text-[#8A8A7A]">
                  2024
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="text-[#8A8A7A] font-bold text-[14px] w-20">Watched</div>
                <div className="border-[1.5px] border-[#2C2E2C14] rounded-lg py-2 px-3 text-[#2C2E2C] font-semibold text-[14px] flex-1">
                  {new Date().toISOString().split("T")[0]}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[#8A8A7A] font-bold text-[14px] w-20">Rating</div>
                <div className="border-[1.5px] border-[#2C2E2C14] rounded-lg py-2 px-3 flex-1 flex justify-center">
                  <StarRating value={rating} interactive size="lg" onChange={setRating} />
                </div>
              </div>
              
              {initialMedia.category === "read" && (
                <div className="flex items-center gap-4">
                  <div className="text-[#8A8A7A] font-bold text-[14px] w-20">Progress</div>
                  <input 
                    type="number" 
                    placeholder="Pages"
                    className="border-[1.5px] border-[#2C2E2C14] rounded-lg py-2 px-3 flex-1 outline-none text-[#2C2E2C] font-semibold text-[14px]"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <textarea 
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Add a review..."
                  className="bg-white border-[1.5px] border-[#2C2E2C14] rounded-xl p-4 text-[15px] text-[#2C2E2C] outline-none resize-none placeholder:text-[#8A8A7A]"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setLiked(!liked)} 
                  className={`rounded-full py-1.5 px-4 text-[13px] font-bold cursor-pointer transition-colors ${liked ? "bg-[#2C2E2C] text-[#FBF8F0]" : "bg-[#2C2E2C0F] text-[#2C2E2C]"}`}
                >
                  {liked ? "♥ Liked" : "Like"}
                </button>
                <button 
                  onClick={() => setRewatch(!rewatch)} 
                  className={`rounded-full py-1.5 px-4 text-[13px] font-bold cursor-pointer transition-colors ${rewatch ? "bg-[#2C2E2C] text-[#FBF8F0]" : "bg-[#2C2E2C0F] text-[#2C2E2C]"}`}
                >
                  Rewatch
                </button>
                <button 
                  onClick={() => setSpoilers(!spoilers)} 
                  className={`rounded-full py-1.5 px-4 text-[13px] font-bold cursor-pointer transition-colors ${spoilers ? "bg-[#2C2E2C] text-[#FBF8F0]" : "bg-[#2C2E2C0F] text-[#2C2E2C]"}`}
                >
                  Spoilers
                </button>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="mt-4 rounded-full py-4 bg-[#2C2E2C] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin text-[#FBF8F0]" /> : (
                 <span className="text-[#FBF8F0] font-bold text-[16px]">Save Entry</span>
              )}
            </button>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center">
            <p className="text-[15px] font-medium text-[#8A8A7A] text-center max-w-sm">
              Search for a movie, book, or game to add a new entry to your vault.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
