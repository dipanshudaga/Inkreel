import { getTrendingWatch } from "@/lib/api/tmdb";
import { getTrendingBooks } from "@/lib/api/google-books";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export default function Home() {
  return (
    <div className="grow flex flex-col py-16 px-20 min-h-screen bg-traced-bg overflow-y-auto">
      <div className="mb-16">
        <h1 className="text-[72px] leading-[1.1] tracking-[-0.03em] text-traced-dark font-serif font-medium italic m-0">
          {getGreeting()}
        </h1>
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-12 bg-traced-accent" />
          <p className="tracking-[0.1em] uppercase text-[#737373] font-sans text-xs font-semibold">
            Personal Media Archive
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <Suspense fallback={<SectionSkeleton title="Watch" href="/watch" />}>
          <TrendingWatch />
        </Suspense>

        <Suspense fallback={<SectionSkeleton title="Read" href="/read" />}>
          <TrendingRead />
        </Suspense>
      </div>
    </div>
  );
}

async function TrendingWatch() {
  const items = await getTrendingWatch(1).then(res => res.slice(0, 5));
  return <TrendingSection title="Watch" href="/watch" items={items} />;
}

async function TrendingRead() {
  const items = await getTrendingBooks(0).then(res => res.slice(0, 5));
  return <TrendingSection title="Read" href="/read" items={items} />;
}

function TrendingSection({ title, href, items }: { title: string, href: string, items: any[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
        <h2 className="text-2xl font-serif font-medium text-traced-dark italic m-0">{title}</h2>
        <Link href={href} className="text-xs font-sans uppercase tracking-widest text-[#737373] hover:text-traced-dark transition-colors font-semibold">
          View Your Diary
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
        {items.map((item: any) => (
          <Link 
            key={item.id} 
            href={`/items/${item.id}`}
            className="flex flex-col gap-6 group"
          >
            <div className="w-full aspect-[2/3] overflow-hidden border-hairline bg-traced-surface relative transition-all duration-700">
              {item.posterUrl ? (
                <div 
                  className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-all duration-1000" 
                  style={{ backgroundImage: `url(${item.posterUrl})` }} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-traced-gray text-[10px] uppercase tracking-widest">
                  No Cover
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-traced-dark font-serif font-medium text-2xl leading-tight line-clamp-2 group-hover:text-traced-accent transition-colors duration-300">
                {item.title}
              </div>
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.1em] text-[#737373] font-sans text-[11px] font-bold">
                  {item.type}
                </span>
                <span className="text-[#D4D4D4]">•</span>
                <span className="uppercase tracking-[0.1em] text-[#A3A3A3] font-sans text-[11px]">
                  {item.year || item.releaseYear || ""}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton({ title, href }: { title: string, href: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4">
        <h2 className="text-2xl font-serif font-medium text-traced-dark italic m-0 opacity-50">{title}</h2>
        <div className="w-24 h-4 bg-black/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-6 animate-pulse">
            <div className="w-full aspect-[2/3] bg-black/5 border-hairline" />
            <div className="flex flex-col gap-3">
              <div className="w-full h-6 bg-black/10" />
              <div className="w-2/3 h-3 bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
