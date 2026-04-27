"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importLetterboxdAction, importGoodreadsAction } from "@/lib/actions/import";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "letterboxd" | "goodreads") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let response;
          if (type === "letterboxd") {
            response = await importLetterboxdAction(results.data);
          } else {
            response = await importGoodreadsAction(results.data);
          }

          if (response.success) {
            setResult({ imported: response.importedCount, skipped: response.skippedCount });
          } else {
            setError("Import failed. Please check the file format.");
          }
        } catch (err) {
          setError("An error occurred during import.");
          console.error(err);
        } finally {
          setIsImporting(false);
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="grow flex flex-col py-16 px-20 bg-traced-bg">
      <div className="mb-16">
        <h1 className="text-[48px] leading-tight tracking-[-0.02em] text-traced-dark font-serif font-medium italic m-0">
          Import Data.
        </h1>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px w-12 bg-traced-accent" />
          <p className="tracking-[0.1em] uppercase text-[#737373] font-sans text-[11px] font-bold">
            Migrate your media from other platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
        {/* Letterboxd Card */}
        <ImportCard 
          title="Letterboxd"
          description="Upload your diary.csv to import your watched movies."
          onUpload={(e) => handleFileUpload(e, "letterboxd")}
          isImporting={isImporting}
        />

        {/* Goodreads Card */}
        <ImportCard 
          title="Goodreads"
          description="Upload your library_export.csv to import your books."
          onUpload={(e) => handleFileUpload(e, "goodreads")}
          isImporting={isImporting}
        />
      </div>

      {result && (
        <div className="mt-12 p-6 border-hairline bg-white/50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CheckCircle2 className="text-green-600 h-6 w-6" />
          <div>
            <p className="font-serif italic text-lg text-traced-dark">Import Complete</p>
            <p className="text-[13px] font-sans text-[#737373] uppercase tracking-widest mt-1">
              {result.imported} items added · {result.skipped} skipped (already exists)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-12 p-6 border-hairline bg-red-50 border-red-200 flex items-center gap-4">
          <AlertCircle className="text-red-600 h-6 w-6" />
          <p className="font-serif italic text-lg text-red-900">{error}</p>
        </div>
      )}
    </div>
  );
}

function ImportCard({ title, description, onUpload, isImporting }: { title: string; description: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; isImporting: boolean }) {
  return (
    <div className="flex flex-col border-hairline bg-white p-10 gap-8 group hover:shadow-xl transition-all duration-700">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-serif font-medium italic text-traced-dark group-hover:text-traced-accent transition-colors">{title}</h3>
        <p className="text-[#737373] text-[14px] leading-relaxed">{description}</p>
      </div>

      <div className="relative">
        <input 
          type="file" 
          accept=".csv"
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={onUpload}
          disabled={isImporting}
        />
        <div className={cn(
          "flex items-center justify-center gap-3 py-4 px-6 border border-[#1A1A1A] font-sans font-bold text-[11px] uppercase tracking-[0.2em] transition-all",
          isImporting ? "bg-traced-surface text-[#A3A3A3]" : "group-hover:bg-traced-dark group-hover:text-white"
        )}>
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isImporting ? "Processing..." : "Select CSV File"}
        </div>
      </div>
    </div>
  );
}
