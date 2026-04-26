"use client";

import { useState } from "react";
import { importCsvAction } from "@/lib/actions/import";

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setIsUploading(true);
      const res = await importCsvAction(text);
      setResult(res);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col w-full bg-[#FBF8F0] antialiased min-h-[calc(100vh-80px)]">
      <div className="flex flex-col items-center pt-20 px-6">
        <div className="max-w-[600px] w-full flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <div className="[letter-spacing:-2px] text-center text-[#2C2E2C] font-extrabold text-[46px] leading-[1] m-0">
              Import Data
            </div>
            <div className="text-center text-[#8A8A7A] font-medium text-base m-0">
              Bring your history from Letterboxd, Goodreads, and BGG.
            </div>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Letterboxd Row */}
            <div className="flex items-center justify-between rounded-2xl bg-white border-[1.5px] border-solid border-[#2C2E2C1F] p-6 relative">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center opacity-[0.15] rounded-xl bg-[#E8643B] shrink-0 w-12 h-12" />
                <div className="flex flex-col gap-1">
                  <div className="inline-block text-[#2C2E2C] font-bold text-base">
                    Letterboxd
                  </div>
                  <div className="inline-block text-[#8A8A7A] font-medium text-[13px]">
                    Import watched movies & ratings (.csv)
                  </div>
                </div>
              </div>
              <div className="rounded-[10px] py-2.5 px-5 bg-[#2C2E2C0F] cursor-pointer hover:bg-black/10 transition-colors relative overflow-hidden">
                <div className="text-[#2C2E2C] font-semibold text-sm pointer-events-none">
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Goodreads Row */}
            <div className="flex items-center justify-between rounded-2xl bg-white border-[1.5px] border-solid border-[#2C2E2C1F] p-6 relative">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center opacity-[0.15] rounded-xl bg-[#D4A843] shrink-0 w-12 h-12" />
                <div className="flex flex-col gap-1">
                  <div className="inline-block text-[#2C2E2C] font-bold text-base">
                    Goodreads
                  </div>
                  <div className="inline-block text-[#8A8A7A] font-medium text-[13px]">
                    Import read books & ratings (.csv)
                  </div>
                </div>
              </div>
              <div className="rounded-[10px] py-2.5 px-5 bg-[#2C2E2C0F] cursor-pointer hover:bg-black/10 transition-colors relative overflow-hidden">
                <div className="text-[#2C2E2C] font-semibold text-sm pointer-events-none">
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* BGG Row */}
            <div className="flex items-center justify-between rounded-2xl bg-white border-[1.5px] border-solid border-[#2C2E2C1F] p-6 relative">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center opacity-[0.15] rounded-xl bg-[#5B8CA8] shrink-0 w-12 h-12" />
                <div className="flex flex-col gap-1">
                  <div className="inline-block text-[#2C2E2C] font-bold text-base">
                    BoardGameGeek
                  </div>
                  <div className="inline-block text-[#8A8A7A] font-medium text-[13px]">
                    Import logged games & ratings (.csv)
                  </div>
                </div>
              </div>
              <div className="rounded-[10px] py-2.5 px-5 bg-[#2C2E2C0F] cursor-pointer hover:bg-black/10 transition-colors relative overflow-hidden">
                <div className="text-[#2C2E2C] font-semibold text-sm pointer-events-none">
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </div>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={isUploading}
                />
              </div>
            </div>

          </div>
          
          {/* Status Display */}
          {result && (
            <div className={`p-4 rounded-xl text-center text-[14px] font-medium ${result.success ? 'bg-[#D4A843]/10 text-[#D4A843]' : 'bg-[#E8643B]/10 text-[#E8643B]'}`}>
              {result.success ? `Successfully imported ${result.count} entries.` : result.error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
