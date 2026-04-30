"use client";

import { useState } from "react";
import { Download, Trash2, Loader2, Check, AlertTriangle } from "lucide-react";
import { purgeDiaryAction } from "@/lib/actions/user-settings";
import { cn } from "@/lib/utils";

export function ArchiveActions() {
  const [purging, setPurging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inkreel-diary-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export diary data.");
    } finally {
      setExporting(false);
    }
  };

  const handlePurge = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setPurging(true);
    try {
      const res = await purgeDiaryAction();
      if (res.error) throw new Error(res.error);
      setShowConfirm(false);
      alert("Archive purged successfully.");
    } catch (error) {
      console.error("Purge error:", error);
      alert("Failed to purge diary data.");
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {/* Export Card */}
      <button 
        onClick={handleExport}
        disabled={exporting}
        className="text-left border border-hairline p-8 flex flex-col gap-6 hover:bg-white transition-all cursor-pointer group disabled:opacity-50"
      >
        <div className="size-10 bg-black text-white flex items-center justify-center rounded-full">
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xl font-serif italic">Export Diary</span>
          <p className="text-[10px] uppercase tracking-wider opacity-30 leading-relaxed">
            {exporting ? "Preparing archive..." : "Download a complete JSON backup."}
          </p>
        </div>
      </button>

      {/* Purge Card */}
      <button 
        onClick={handlePurge}
        onMouseLeave={() => setShowConfirm(false)}
        disabled={purging}
        className={cn(
          "text-left border border-hairline p-8 flex flex-col gap-6 transition-all cursor-pointer group disabled:opacity-50",
          showConfirm ? "bg-red-600 text-white border-red-600" : "hover:bg-red-50"
        )}
      >
        <div className={cn(
          "size-10 flex items-center justify-center rounded-full",
          showConfirm ? "bg-white text-red-600" : "bg-red-600 text-white"
        )}>
          {purging ? <Loader2 size={18} className="animate-spin" /> : showConfirm ? <AlertTriangle size={18} /> : <Trash2 size={18} />}
        </div>
        <div className="flex flex-col gap-1">
          <span className={cn(
            "text-xl font-serif italic",
            !showConfirm && "text-red-600"
          )}>
            {showConfirm ? "Are you sure?" : "Purge Diary"}
          </span>
          <p className={cn(
            "text-[10px] uppercase tracking-wider leading-relaxed",
            showConfirm ? "text-white/60" : "text-red-600/40"
          )}>
            {showConfirm ? "Click again to confirm delete." : "Permanently erase all entries."}
          </p>
        </div>
      </button>
    </div>
  );
}
