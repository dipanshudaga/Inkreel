"use client";

import { useEffect, useState, useRef } from "react";
import { useQuickLogStore } from "@/store/use-quick-log-store";
import { X, Check } from "lucide-react";
import { addQuickLog } from "@/lib/actions/log-actions";

export function QuickLogModal() {
  const { isOpen, closeQuickLog, mediaId: initialMediaId } = useQuickLogStore();
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/media/active")
        .then((res) => res.json())
        .then((data) => {
          setActiveItems(data);
          if (initialMediaId) {
            setSelectedId(initialMediaId);
          } else if (data.length > 0) {
            setSelectedId(data[0].id);
          }
        });
    }
  }, [isOpen, initialMediaId]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setIsSubmitting(true);
    const formData = new FormData(formRef.current!);
    formData.append("mediaId", selectedId);

    try {
      const res = await addQuickLog(formData);
      if (res.success) {
        closeQuickLog();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 antialiased">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={closeQuickLog}
      />
      
      <div className="relative w-full max-w-xl bg-traced-bg border-hairline flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b-hairline bg-white">
          <h2 className="tracking-[0.05em] uppercase text-traced-dark font-sans font-semibold text-[13px]">
            Quick Log Activity
          </h2>
          <button onClick={closeQuickLog} className="text-[#737373] hover:text-traced-dark transition-colors">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-8 flex flex-col gap-8">
            {/* Media Selection */}
            <div className="flex flex-col gap-3">
              <label className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-semibold">
                Select Title
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {activeItems.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`flex items-center gap-4 p-3 border-hairline cursor-pointer transition-all ${
                      selectedId === item.id ? 'bg-traced-accent text-white border-traced-accent' : 'bg-white hover:bg-traced-surface text-traced-dark'
                    }`}
                  >
                    <div className="w-10 h-15 shrink-0 bg-traced-surface border-hairline overflow-hidden">
                       <img src={item.posterUrl} alt="" className="size-full object-cover" />
                    </div>
                    <div className="grow flex flex-col">
                      <span className="font-serif font-medium text-[15px]">{item.title}</span>
                      <span className={`text-[10px] uppercase tracking-widest ${selectedId === item.id ? 'text-white/80' : 'text-[#737373]'}`}>
                        {item.type}
                      </span>
                    </div>
                    {selectedId === item.id && <Check size={16} className="ml-auto" />}
                  </div>
                ))}
                {activeItems.length === 0 && (
                  <div className="py-8 text-center border-hairline border-dashed text-[#737373] font-sans text-xs uppercase tracking-[0.05em]">
                    No active media to log
                  </div>
                )}
              </div>
            </div>

            {/* Progress and Notes */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-semibold">
                  Progress (Ep/Pg)
                </label>
                <input 
                  type="number" 
                  name="progress"
                  placeholder="e.g. 12"
                  className="bg-white border-hairline h-12 px-4 font-sans text-sm focus:outline-none focus:border-traced-accent transition-colors"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="uppercase tracking-[0.05em] text-[#737373] font-sans text-[11px] font-semibold">
                  Quick Note
                </label>
                <input 
                  type="text" 
                  name="notes"
                  placeholder="e.g. S1 E12"
                  className="bg-white border-hairline h-12 px-4 font-sans text-sm focus:outline-none focus:border-traced-accent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#EFEEE8] border-t-hairline flex justify-end gap-4">
            <button 
              type="button"
              onClick={closeQuickLog}
              className="px-6 h-12 font-sans text-xs uppercase tracking-widest font-semibold text-[#737373] hover:text-traced-dark transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!selectedId || isSubmitting}
              className="bg-traced-dark text-white px-8 h-12 font-sans text-xs uppercase tracking-widest font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
