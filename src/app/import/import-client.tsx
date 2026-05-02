"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, ExternalLink, Search, X, Check } from "lucide-react";
import { parseLetterboxdZip } from "@/lib/importers/letterboxd";
import { parseGoodreadsCsv } from "@/lib/importers/goodreads";
import { ImportItem } from "@/lib/importers/types";
import { cn } from "@/lib/utils";
import { saveImportedMediaAction, getUserMediaAction, batchSearchMediaAction, searchMediaAction } from "@/lib/actions/media";
import { useMediaStore } from "@/store/use-media-store";
import { MediaCard } from "@/components/item/media-card";

type ImportState = "idle" | "parsing" | "reviewing" | "saving" | "complete" | "error";

export function ImportClient() {
  const setItems = useMediaStore(state => state.setItems);
  const [state, setState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [items, setItemsToReview] = useState<ImportItem[]>([]);
  const [summary, setSummary] = useState<{ watch: number; read: number; total: number }>({ watch: 0, read: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Manual Rematch State
  const [rematchId, setRematchId] = useState<string | null>(null);
  const [rematchSearch, setRematchSearch] = useState("");
  const [rematchResults, setRematchResults] = useState<any[]>([]);
  const [isSearchingRematch, setIsSearchingRematch] = useState(false);

  const processFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");
    setError(null);
    setProcessedCount(0);
    let rawItems: ImportItem[] = [];

    try {
      if (file.name.endsWith(".zip")) {
        rawItems = await parseLetterboxdZip(file);
      } else if (file.name.endsWith(".csv")) {
        rawItems = await parseGoodreadsCsv(file);
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
          query: item.title,
          year: item.year,
          author: item.creator,
          isbn: item.isbn,
          category: item.category
        }));

        const res = await batchSearchMediaAction(queries as any);
        if (res.success && res.results) {
          setItemsToReview(prev => {
            const newItems = [...prev];
            res.results?.forEach((match, index) => {
              const originalItem = currentBatch[index];
              const itemToUpdate = newItems.find(it => it.externalId === originalItem.externalId);

              if (itemToUpdate) {
                if (match) {
                  itemToUpdate.posterUrl = match.posterUrl;
                  itemToUpdate.matchedId = match.id;
                  itemToUpdate.isDocumentary = match.isDocumentary;
                  itemToUpdate.type = match.type;
                  itemToUpdate.matched = true;
                } else {
                  itemToUpdate.matchedId = "not-found";
                  itemToUpdate.matched = false;
                }
              }
            });
            return newItems;
          });
          setProcessedCount(prev => Math.min(prev + batchSize, matchLimit));
        }
        setProgress(Math.round(((i + batchSize) / matchLimit) * 100));

        // Staggered delay between batches
        if (i + batchSize < matchLimit) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

    } catch (err: any) {
      setError(err.message);
      setState("error");
    }
  };

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleManualSearch = useCallback(async (val: string, year?: string, immediate = false) => {
    setRematchSearch(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (val.length < 2) {
      setRematchResults([]);
      setIsSearchingRematch(false);
      return;
    }

    setIsSearchingRematch(true);
    // Clear previous results immediately to prevent stale UI
    if (immediate) setRematchResults([]);

    const performSearch = async () => {
      const item = items.find(it => it.externalId === rematchId);
      const res = await searchMediaAction(val, item?.category || "watch", year, item?.creator);
      if (res.success) setRematchResults(res.results);
      setIsSearchingRematch(false);
    };

    if (immediate) {
      performSearch();
    } else {
      searchTimeout.current = setTimeout(performSearch, 300);
    }
  }, [items, rematchId]);

  const lastRematchId = useRef<string | null>(null);

  useEffect(() => {
    if (rematchId !== null && rematchId !== lastRematchId.current) {
      lastRematchId.current = rematchId;
      const item = items.find(it => it.externalId === rematchId);
      if (item) handleManualSearch(item.title, item.year, true);
    } else if (rematchId === null) {
      lastRematchId.current = null;
    }
  }, [rematchId, items, handleManualSearch]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRematchId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const applyRematch = (match: any) => {
    if (rematchId === null) return;
    setItemsToReview(prev => {
      const newItems = [...prev];
      const itemToUpdate = newItems.find(it => it.externalId === rematchId);
      if (itemToUpdate) {
        itemToUpdate.posterUrl = match.posterUrl;
        itemToUpdate.matchedId = match.id;
        itemToUpdate.title = match.title;
        itemToUpdate.year = match.year;
        itemToUpdate.isDocumentary = match.isDocumentary;
        itemToUpdate.type = match.type;
        itemToUpdate.matched = true;
      }
      return newItems;
    });
    setRematchId(null);
    setRematchSearch("");
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
      "grid gap-20 transition-all duration-700 items-stretch",
      isWide ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_400px]"
    )}>

      <div className="flex flex-col gap-12">

        {state === "idle" && (
          <section className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-serif italic">Upload Source</h2>
            </div>
            <div className="border-2 border-dashed flex flex-col items-center justify-center gap-6 border-dark/20 hover:border-accent bg-surface/10 relative cursor-pointer group h-[320px]">
              <div className="size-16 rounded-full border border-dark/10 flex items-center justify-center mb-4 group-hover:bg-dark group-hover:text-white transition-all duration-500">
                <Upload size={20} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-xl font-serif font-medium italic">Drop your data here</h3>
                <p className="text-sm opacity-40 uppercase tracking-widest font-medium">Supporting Letterboxd (ZIP) & Goodreads (CSV)</p>
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".zip,.csv" onChange={processFiles} title="" />
            </div>
          </section>
        )}

        {(state === "parsing" || state === "reviewing") && (
          <section className="flex flex-col gap-10">
            <div className="flex items-center justify-between pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif italic">Review Matches</h2>
                <p className="text-[10px] uppercase tracking-widest font-medium opacity-40">
                  {state === "parsing" ? "Analyzing structure..." :
                    `Verified ${items.filter(it => it.matchedId && it.matchedId !== 'not-found').length} of ${summary.total} titles`}
                </p>
              </div>
            </div>

            <div className={cn(
              "grid gap-x-8 gap-y-12",
              isWide ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"
            )}>
              {items.slice(0, 500).map((item, i) => (
                <MediaCard
                  key={item.externalId}
                  item={{
                    ...item,
                    id: `import-${i}`,
                    posterUrl: item.posterUrl || null
                  }}
                  variant="import"
                  onClick={() => {
                    setRematchId(item.externalId);
                    setRematchSearch(item.title);
                  }}
                  onExclude={() => {
                    setItemsToReview(prev => {
                      const newItems = prev.filter(it => it.externalId !== item.externalId);
                      setSummary({
                        watch: newItems.filter(it => it.category === "watch").length,
                        read: newItems.filter(it => it.category === "read").length,
                        total: newItems.length
                      });
                      return newItems;
                    });
                  }}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-8 pt-12 border-t border-dark/5">
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="text-4xl font-serif italic">Ready to sync?</h3>
                <p className="text-xs opacity-40 uppercase tracking-widest font-medium max-w-sm">
                  We've verified your collection. Click below to permanently integrate these titles into your private vault.
                </p>
              </div>
              <button
                onClick={handleFinalSave}
                disabled={state === "parsing"}
                className="bg-dark text-white py-6 px-16 text-[11px] uppercase tracking-[0.3em] font-medium hover:bg-accent transition-all duration-300 transform hover:scale-105 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl"
              >
                Confirm & Sync Collection
              </button>
            </div>
          </section>
        )}

        {state === "saving" && (
          <div className="flex flex-col items-center justify-center py-40 gap-8">
            <Loader2 size={64} className="animate-spin text-accent" />
            <div className="flex flex-col items-center gap-2 text-center w-full max-w-sm">
              <h3 className="text-2xl font-serif font-medium italic">Populating your vault</h3>
              <div className="w-full h-1 bg-dark/10 mt-6 overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-medium opacity-50 mt-2">{progress}% synced</span>
            </div>
          </div>
        )}

        {state === "complete" && (
          <div className="flex flex-col items-center gap-6 py-40 text-center animate-in fade-in zoom-in duration-700">
            <div className="size-24 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl">
              <CheckCircle2 size={40} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-4xl font-serif font-medium italic">Import Completed.</h3>
              <p className="text-sm opacity-50 max-w-sm">
                {summary.total} titles have been perfectly matched and integrated into your private diary.
              </p>
            </div>
            <button
              onClick={() => setState("idle")}
              className="mt-8 py-4 px-12 border-2 border-black hover:bg-black hover:text-white transition-all text-[10px] uppercase tracking-widest font-medium"
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
              className="mt-8 py-4 px-12 border-2 border-black hover:bg-black hover:text-white transition-all text-[10px] uppercase tracking-widest font-medium"
            >
              Restart Process
            </button>
          </div>
        )}

      </div>

      {!isWide && (
        <aside className="flex flex-col pt-16">
          <div className="p-10 border border-hairline bg-surface flex flex-col justify-center gap-8 h-[320px]">
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-gray border-b border-dark/10 pb-4">Data Sources</span>
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-serif italic">Letterboxd</h4>
                  <a href="https://letterboxd.com/settings/data/" target="_blank" className="text-accent"><ExternalLink size={14} /></a>
                </div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-medium">Settings &gt; Import & Export &gt; Export Your Data.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-serif italic">Goodreads</h4>
                  <a href="https://www.goodreads.com/review/import" target="_blank" className="text-accent"><ExternalLink size={14} /></a>
                </div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-medium">My Books &gt; Import and Export &gt; Export Library.</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Manual Rematch Modal - Centered in Right Field */}
      {rematchId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 lg:pl-[288px]"
          onClick={() => setRematchId(null)}
        >
          <div
            className="w-full max-w-4xl h-[70vh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b-hairline bg-white sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-serif italic tracking-tight">Rematch</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-30">Correcting: {items.find(it => it.externalId === rematchId)?.title}</p>
              </div>
              <button
                onClick={() => setRematchId(null)}
                className="size-10 flex items-center justify-center hover:bg-dark hover:text-white rounded-full transition-all duration-300"
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
                  className="w-full bg-transparent border-b-2 border-dark pb-4 text-3xl md:text-4xl font-serif italic focus:outline-none placeholder:opacity-10"
                />
                {isSearchingRematch && (
                  <div className="absolute right-0 bottom-4">
                    <Loader2 size={24} className="animate-spin text-accent" />
                  </div>
                )}
              </div>

              {rematchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {rematchResults.map((res: any) => (
                    <MediaCard
                      key={res.id}
                      item={res}
                      variant="rematch"
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
