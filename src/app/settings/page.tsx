import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Database, Upload, Trash2, Info, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const totalEntries = await db.select({ value: count() }).from(media).where(eq(media.userId, userId));

  return (
    <div className="min-h-screen bg-bg text-dark selection:bg-accent selection:text-white pb-20 pt-24 px-10">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <header className="mb-20 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <h1 className="text-7xl lg:text-[100px] font-serif font-medium italic tracking-[-0.05em] leading-[0.8] m-0">
              Settings.
            </h1>
            <div className="h-px grow bg-dark/10" />
          </div>
          <p className="text-xl font-serif italic opacity-40 max-w-xl">
            Configure your diary parameters and manage external data streams.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20">
          
          {/* Main Controls */}
          <div className="flex flex-col gap-24">
            
            {/* Import Section */}
            <section className="flex flex-col gap-10">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-gray">01</span>
                <h2 className="text-3xl font-serif italic">Data Ingestion</h2>
              </div>
              
              <div className="border border-hairline bg-white/30 p-12 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-serif font-medium italic">CSV/JSON Import</h3>
                  <p className="text-sm opacity-50 leading-relaxed max-w-md">
                    Seamlessly migrate your existing collection from Letterboxd, Goodreads, or custom spreadsheets.
                  </p>
                </div>

                <div className="flex items-center justify-center border-2 border-dashed border-dark/20 h-48 group hover:border-accent transition-colors cursor-pointer relative overflow-hidden">
                  <div className="flex flex-col items-center gap-4 group-hover:scale-105 transition-transform">
                    <Upload size={32} className="opacity-20 group-hover:text-accent group-hover:opacity-100 transition-all" />
                    <span className="text-[10px] uppercase tracking-widest font-medium">Select File to Import</span>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.json" />
                </div>
              </div>
            </section>

            {/* Storage Section */}
            <section className="flex flex-col gap-10">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-gray">02</span>
                <h2 className="text-3xl font-serif italic">Diary Management</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-hairline p-10 flex flex-col gap-6 bg-white/20">
                  <div className="size-12 bg-black text-white flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-medium opacity-30">Capacity</span>
                    <span className="text-2xl font-serif italic">{totalEntries[0]?.value || 0} Entries</span>
                  </div>
                </div>

                <div className="border border-hairline p-10 flex flex-col gap-6 bg-red-50/10 hover:bg-red-50/20 transition-colors group cursor-pointer">
                  <div className="size-12 bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-medium text-red-600/50">Danger Zone</span>
                    <span className="text-2xl font-serif italic text-red-600">Purge Diary</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar / Info */}
          <aside className="flex flex-col gap-12 pt-16">
            <div className="p-10 border border-hairline bg-surface flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Info size={16} className="opacity-30" />
                <span className="text-[9px] uppercase tracking-widest font-medium opacity-30">Information</span>
              </div>
              <p className="text-base font-serif italic leading-relaxed opacity-60">
                Inkreel is a private-first media diary. All data ingested is processed locally and stored securely in your private vault.
              </p>
            </div>

            <nav className="flex flex-col border border-hairline divide-y divide-hairline">
               <Link href="/account" className="p-6 flex items-center justify-between hover:bg-black/5 transition-colors group">
                 <span className="text-[10px] uppercase tracking-widest font-medium">Manage Profile</span>
                 <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
               </Link>
               <a href="#" className="p-6 flex items-center justify-between hover:bg-black/5 transition-colors group">
                 <span className="text-[10px] uppercase tracking-widest font-medium">Documentation</span>
                 <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
               </a>
            </nav>
          </aside>

        </div>
      </div>
    </div>
  );
}
