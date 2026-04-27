import { db } from "@/lib/db";
import { media, logs } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { Settings as SettingsIcon, Database, Info, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [mediaCount] = await db.select({ count: sql<number>`count(*)` }).from(media);
  const [logCount] = await db.select({ count: sql<number>`count(*)` }).from(logs);

  const stats = [
    { label: "Items in Archive", value: mediaCount?.count || 0, icon: Database },
    { label: "Total Diary Entries", value: logCount?.count || 0, icon: Info },
  ];

  return (
    <div className="grow flex flex-col py-16 px-20 bg-traced-bg">
      <div className="mb-16">
        <h1 className="text-[48px] leading-tight tracking-[-0.02em] text-traced-dark font-serif font-medium italic m-0">
          Settings.
        </h1>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px w-12 bg-traced-accent" />
          <p className="tracking-[0.1em] uppercase text-[#737373] font-sans text-[11px] font-bold">
            Manage your personal media database.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12 max-w-2xl">
        <section className="flex flex-col gap-6">
          <h2 className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px] border-b-hairline pb-4">
            Database Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white border-hairline p-8 flex flex-col gap-4">
                <stat.icon className="h-5 w-5 text-traced-accent" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-4xl font-serif font-medium text-traced-dark italic">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-[#737373] font-sans font-bold mt-2">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px] border-b-hairline pb-4">
            Data Management
          </h2>
          <div className="flex flex-col border-hairline bg-white divide-y divide-[#F0F0F0]">
            <div className="p-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-serif italic text-lg text-traced-dark">Storage Mode</span>
                <span className="text-[13px] text-[#737373]">Currently using Supabase (Remote PostgreSQL)</span>
              </div>
              <div className="px-4 py-1.5 border-hairline bg-traced-surface text-[10px] uppercase tracking-widest font-bold">
                Cloud Sync Active
              </div>
            </div>
            
            <button className="p-6 flex items-center justify-between hover:bg-red-50 group transition-colors cursor-pointer text-left">
              <div className="flex flex-col gap-1">
                <span className="font-serif italic text-lg text-red-900 group-hover:text-red-600">Reset Database</span>
                <span className="text-[13px] text-red-700/60">Permanently delete all archived items and logs.</span>
              </div>
              <Trash2 className="h-5 w-5 text-red-200 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="tracking-[0.05em] uppercase text-[#737373] font-sans font-semibold text-[13px] border-b-hairline pb-4">
            About Traced.
          </h2>
          <div className="p-8 border-hairline bg-white/50 flex flex-col gap-4">
            <p className="text-[14px] text-[#737373] leading-relaxed italic">
              Traced is designed as a minimalist, focused diary for your media consumption. It prioritizes data clarity and utilitarian aesthetics over social noise.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-sans font-bold text-traced-dark uppercase tracking-widest">Version 3.0.0</span>
              <span className="text-[#D4D4D4]">•</span>
              <span className="text-[11px] font-sans text-[#A3A3A3] uppercase tracking-widest">Build 2026.04.27</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
