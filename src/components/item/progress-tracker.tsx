"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface ProgressTrackerProps {
  mediaId: string;
  type: string;
  totalEpisodes?: number;
  totalSeasons?: number;
  totalChapters?: number;
  totalVolumes?: number;
  initialProgress?: any;
}

export function ProgressTracker({ 
  mediaId, 
  type, 
  totalEpisodes, 
  totalSeasons,
  totalChapters,
  totalVolumes,
  initialProgress 
}: ProgressTrackerProps) {
  const [season, setSeason] = useState(initialProgress?.season || 1);
  const [episode, setEpisode] = useState(initialProgress?.episode || 1);
  const [chapter, setChapter] = useState(initialProgress?.chapter || 1);
  const [volume, setVolume] = useState(initialProgress?.volume || 1);

  const isVideo = type === "tv" || type === "anime";
  const isPrint = type === "manga";

  if (!isVideo && !isPrint) return null;

  return (
    <div className="py-12 px-16 border-b-hairline flex flex-col gap-8">
      <h3 className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans font-medium text-[11px]">
        Progress Tracking
      </h3>

      <div className="flex gap-16">
        {isVideo && (
          <>
            <div className="flex flex-col gap-4">
              <span className="text-[11px] uppercase tracking-widest text-[#737373] font-sans font-medium">Season</span>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setSeason(Math.max(1, season - 1))}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-3xl font-serif min-w-[1.5ch] text-center">{season}</span>
                <button 
                  onClick={() => setSeason(totalSeasons ? Math.min(totalSeasons, season + 1) : season + 1)}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[11px] uppercase tracking-widest text-[#737373] font-sans font-medium">Episode</span>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setEpisode(Math.max(1, episode - 1))}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-3xl font-serif min-w-[2ch] text-center">{episode}</span>
                <button 
                  onClick={() => setEpisode(totalEpisodes ? Math.min(totalEpisodes, episode + 1) : episode + 1)}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </>
        )}

        {isPrint && (
          <>
            <div className="flex flex-col gap-4">
              <span className="text-[11px] uppercase tracking-widest text-[#737373] font-sans font-medium">Volume</span>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setVolume(Math.max(1, volume - 1))}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-3xl font-serif min-w-[1.5ch] text-center">{volume}</span>
                <button 
                  onClick={() => setVolume(totalVolumes ? Math.min(totalVolumes, volume + 1) : volume + 1)}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[11px] uppercase tracking-widest text-[#737373] font-sans font-medium">Chapter</span>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setChapter(Math.max(1, chapter - 1))}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-3xl font-serif min-w-[2ch] text-center">{chapter}</span>
                <button 
                  onClick={() => setChapter(totalChapters ? Math.min(totalChapters, chapter + 1) : chapter + 1)}
                  className="size-8 flex items-center justify-center border-hairline hover:bg-dark hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <button 
        className="self-start py-3 px-8 bg-dark text-white font-sans font-medium text-[11px] uppercase tracking-widest hover:bg-accent transition-colors"
        onClick={() => {
          // Future: persist this to a log entry
          console.log("Logged progress:", { season, episode, chapter, volume });
        }}
      >
        Log Progress
      </button>
    </div>
  );
}
