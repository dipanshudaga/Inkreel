"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, ExternalLink, Search, X, Check } from "lucide-react";
import JSZip from "jszip";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { saveImportedMediaAction, getUserMediaAction, batchSearchMediaAction, searchMediaAction } from "@/lib/actions/media";
import { useMediaStore } from "@/store/use-media-store";
import { MediaCard } from "@/components/item/media-card";

type ImportState = "idle" | "parsing" | "reviewing" | "saving" | "complete" | "error";

interface ImportItem {
  title: string;
  year: string;
  category: "watch" | "read";
  status: string;
  externalId: string;
  posterUrl?: string;
  matchedId?: string;
  creator?: string;
}

export function ImportClient() {
  const setItems = useMediaStore(state => state.setItems);
  const [state, setState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [items, setItemsToReview] = useState<ImportItem[]>([]);
  const [summary, setSummary] = useState<{ watch: number; read: number; total: number }>({ watch: 0, read: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Manual Rematch State
  const [rematchIndex, setRematchIndex] = useState<number | null>(null);
  const [rematchSearch, setRematchSearch] = useState("");
  const [rematchResults, setRematchResults] = useState<any[]>([]);
  const [isSearchingRematch, setIsSearchingRematch] = useState(false);

  const processFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");
    setError(null);
    setVerifiedCount(0);
    let rawItems: ImportItem[] = [];

    try {
      if (file.name.endsWith(".zip")) {
        const zip = await JSZip.loadAsync(file);
        
        const watchedCsv = zip.file("watched.csv");
        if (watchedCsv) {
          const content = await watchedCsv.async("text");
          const parsed = Papa.parse(content, { header: true }).data;
          rawItems.push(...parsed.map((row: any) => ({
             title: row.Name,
             year: row.Year,
             category: "watch",
             status: "completed",
             externalId: row["Letterboxd URI"]
          })));
        }

        const watchlistCsv = zip.file("watchlist.csv");
        if (watchlistCsv) {
          const content = await watchlistCsv.async("text");
          const parsed = Papa.parse(content, { header: true }).data;
          rawItems.push(...parsed.map((row: any) => ({
             title: row.Name,
             year: row.Year,
             category: "watch",
             status: "watchlist",
             externalId: row["Letterboxd URI"]
          })));
        }

        const likesCsv = zip.file("likes/films.csv");
        if (likesCsv) {
          const content = await likesCsv.async("text");
          const parsed = Papa.parse(content, { header: true }).data;
          parsed.forEach((row: any) => {
             const existing = rawItems.find(i => i.title === row.Name && i.year === row.Year);
             if (existing) existing.status = "loved";
             else {
               rawItems.push({
                 title: row.Name,
                 year: row.Year,
                 category: "watch",
                 status: "loved",
                 externalId: row["Letterboxd URI"]
               });
             }
          });
        }
      } else if (file.name.endsWith(".csv")) {
        const content = await file.text();
        const parsed = Papa.parse(content, { header: true }).data;
        rawItems = parsed.map((row: any) => {
          if (!row.Title) return null;
          let status = "completed";
          if (row.Shelves?.includes("to-read")) status = "shelf";
          return {
            title: row.Title,
            creator: row.Author,
            category: "read",
            status: status,
            year: row["Year Published"] || row["Original Publication Year"],
            externalId: `gb-import-${row["Book Id"]}`
          };
        }).filter(Boolean) as ImportItem[];
      }

      if (rawItems.length === 0) throw new Error("No valid items found.");

      setState("reviewing");
      const enrichedItems: ImportItem[] = [...rawItems];
      setItemsToReview(enrichedItems);
      setSummary({
        watch: enrichedItems.filter(i => i.category === "watch").length,
        read: enrichedItems.filter(i => i.category === "read").length,
        total: enrichedItems.length
      });

      const batchSize = 10;
      const matchLimit = Math.min(enrichedItems.length, 500); 
      
      for (let i = 0; i < matchLimit; i += batchSize) {
        const currentBatch = enrichedItems.slice(i, i + batchSize);
        const queries = currentBatch.map(item => ({
          query: `${item.title} ${item.year}`,
          category: item.category
        }));

        const res = await batchSearchMediaAction(queries);
        if (res.success && res.results) {
          res.results.forEach((match, index) => {
            const itemIdx = i + index;
            if (match) {
              enrichedItems[itemIdx].posterUrl = match.posterUrl;
              enrichedItems[itemIdx].matchedId = match.id;
            } else {
              enrichedItems[itemIdx].matchedId = "not-found";
            }
          });
          setItemsToReview([...enrichedItems]);
          setVerifiedCount(prev => Math.min(prev + batchSize, matchLimit));
        }
        setProgress(Math.round(((i + batchSize) / matchLimit) * 100));
      }

    } catch (err: any) {
      setError(err.message);
      setState("error");
    }
  };

  const handleManualSearch = useCallback(async (val: string) => {
    setRematchSearch(val);
    if (val.length < 2) {
      setRematchResults([]);
      return;
    }
    setIsSearchingRematch(true);
    const res = await searchMediaAction(val, "watch");
    if (res.success) setRematchResults(res.results);
    setIsSearchingRematch(false);
  }, []);

  useEffect(() => {
    if (rematchIndex !== null) {
      const item = items[rematchIndex];
      handleManualSearch(item.title);
    }
  }, [rematchIndex, items, handleManualSearch]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRematchIndex(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const applyRematch = (match: any) => {
    if (rematchIndex === null) return;
    const newItems = [...items];
    newItems[rematchIndex].posterUrl = match.posterUrl;
    newItems[rematchIndex].matchedId = match.id;
    newItems[rematchIndex].title = match.title;
    newItems[rematchIndex].year = match.year;
    setItemsToReview(newItems);
    setRematchIndex(null);
    setRematchResults([]);
  };

  const handleFinalSave = async () => {
    setState("saving");
    setProgress(0);
    try {
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await saveImportedMediaAction(chunk.map(item => ({
          ...item,
          externalId: item.matchedId === "not-found" ? item.externalId : (item.matchedId || item.externalId),
          posterUrl: item.posterUrl
        })));
        setProgress(Math.round(((i + chunk.length) / items.length) * 100));
      }

      const syncRes = await getUserMediaAction();
      if (syncRes.success) setItems(syncRes.items);
      setState("complete");
    } catch (err: any) {
      setError(err.message);
      setState("error");
    }
  };

  const isWide = state === "reviewing" || state === "saving";

  return (
    <div className={cn(
      "grid gap-20 transition-all duration-700",
      isWide ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_400px]"
    )}>
      
      <div className="flex flex-col gap-12">
        
        {state === "idle" && (
          <section className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-traced-gray">01</span>
              <h2 className="text-3xl font-serif italic">Upload Source</h2>
            </div>
            <div className="border-2 border-dashed p-20 flex flex-col items-center justify-center gap-6 border-traced-dark/20 hover:border-traced-accent bg-white/20 relative cursor-pointer group">
              <div className="size-20 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-xl font-serif font-medium italic">Drop your data here</h3>
                <p className="text-sm opacity-40 uppercase tracking-widest font-bold">Supporting Letterboxd (ZIP) & Goodreads (CSV)</p>
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".zip,.csv" onChange={processFiles} />
            </div>
          </section>
        )}

        {(state === "parsing" || state === "reviewing") && (
          <section className="flex flex-col gap-10">
            <div className="flex items-center justify-between pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif italic">Review Matches</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">
                  {state === "parsing" ? "Analyzing structure..." : `Verified ${verifiedCount} of ${Math.min(summary.total, 500)} titles`}
                </p>
              </div>
            </div>

            <div className={cn(
              "grid gap-x-8 gap-y-12",
              isWide ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"
            )}>
              {items.slice(0, 500).map((item, i) => (
                <MediaCard 
                  key={i}
                  item={{
                    ...item,
                    id: `import-${i}`,
                    posterUrl: item.posterUrl || null
                  }}
                  variant="import"
                  onClick={() => setRematchIndex(i)}
                  showStatusIndicator={true}
                />
              ))}
            </div>

            <div className="mt-20 flex flex-col items-center gap-8 pt-20">
               <div className="flex flex-col items-center gap-2 text-center">
                 <h3 className="text-4xl font-serif italic">Ready to sync?</h3>
                 <p className="text-xs opacity-40 uppercase tracking-widest font-bold max-w-sm">
                   We've verified your collection. Click below to permanently integrate these titles into your private vault.
                 </p>
               </div>
               <button 
                onClick={handleFinalSave}
                disabled={state === "parsing"}
                className="bg-black text-white py-6 px-16 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-traced-accent transition-all duration-300 transform hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl"
              >
                Confirm & Sync Collection
              </button>
            </div>
          </section>
        )}

        {state === "saving" && (
           <div className="flex flex-col items-center justify-center py-40 gap-8">
             <Loader2 size={64} className="animate-spin text-traced-accent" />
             <div className="flex flex-col items-center gap-2 text-center w-full max-w-sm">
                <h3 className="text-2xl font-serif font-medium italic">Populating your vault</h3>
                <div className="w-full h-1 bg-black/10 mt-6 overflow-hidden">
                  <div className="h-full bg-traced-accent transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mt-2">{progress}% synced</span>
             </div>
           </div>
        )}

        {state === "complete" && (
          <div className="flex flex-col items-center gap-6 py-40 text-center animate-in fade-in zoom-in duration-700">
            <div className="size-24 rounded-full bg-traced-accent text-white flex items-center justify-center shadow-2xl">
              <CheckCircle2 size={40} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-4xl font-serif font-medium italic">Archive Synchronized.</h3>
              <p className="text-sm opacity-50 max-w-sm">
                {summary.total} titles have been perfectly matched and integrated into your private diary.
              </p>
            </div>
            <button 
              onClick={() => setState("idle")}
              className="mt-8 py-4 px-12 border-2 border-black hover:bg-black hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold"
            >
              Continue Collecting
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-6 py-40 text-center">
            <div className="size-24 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl">
              <AlertCircle size={40} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-4xl font-serif font-medium italic">Synchronization Halted.</h3>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setState("idle")}
              className="mt-8 py-4 px-12 border-2 border-black hover:bg-black hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold"
            >
              Restart Process
            </button>
          </div>
        )}

      </div>

      {!isWide && (
        <aside className="flex flex-col gap-12 pt-16">
          <div className="p-10 border border-hairline bg-traced-surface flex flex-col gap-8">
             <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-traced-gray border-b border-traced-dark/10 pb-4">Data Sources</span>
             <div className="flex flex-col gap-10">
               <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                   <h4 className="text-lg font-serif italic">Letterboxd</h4>
                   <a href="https://letterboxd.com/settings/data/" target="_blank" className="text-traced-accent"><ExternalLink size={14} /></a>
                 </div>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Settings &gt; Import & Export &gt; Export Your Data.</p>
               </div>
               <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                   <h4 className="text-lg font-serif italic">Goodreads</h4>
                   <a href="https://www.goodreads.com/review/import" target="_blank" className="text-traced-accent"><ExternalLink size={14} /></a>
                 </div>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">My Books &gt; Import and Export &gt; Export Library.</p>
               </div>
             </div>
          </div>
        </aside>
      )}

      {/* Manual Rematch Modal - Centered in Right Field */}
      {rematchIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 lg:pl-[288px]"
          onClick={() => setRematchIndex(null)}
        >
          <div 
             className="w-full max-w-4xl h-[70vh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 rounded-sm"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b-hairline bg-white sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif italic tracking-tight">Rematch</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Correcting: {items[rematchIndex].title}</p>
              </div>
              <button 
                onClick={() => setRematchIndex(null)} 
                className="size-10 flex items-center justify-center hover:bg-black hover:text-white rounded-full transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="relative mb-10">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Find replacement..."
                  value={rematchSearch}
                  onChange={(e) => handleManualSearch(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black pb-4 text-3xl md:text-4xl font-serif italic focus:outline-none placeholder:opacity-10"
                />
                {isSearchingRematch && (
                  <div className="absolute right-0 bottom-4">
                    <Loader2 size={24} className="animate-spin text-traced-accent" />
                  </div>
                )}
              </div>

              {rematchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {rematchResults.map((res: any) => (
                    <MediaCard 
                      key={res.id}
                      item={res}
                      variant="import"
                      onClick={() => applyRematch(res)}
                    />
                  ))}
                </div>
              ) : rematchSearch.length > 2 && !isSearchingRematch ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-10">
                  <Search size={48} strokeWidth={1} />
                  <p className="mt-4 text-lg font-serif italic text-center">No exact matches found.</p>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center opacity-10">
                  <Search size={48} strokeWidth={1} />
                  <p className="mt-4 text-lg font-serif italic text-center">Start typing to see alternatives</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
