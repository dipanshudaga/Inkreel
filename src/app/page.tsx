import { getTrendingWatch } from "@/lib/api/tmdb";
import { getTrendingBooks } from "@/lib/api/google-books";
import Link from "next/link";
import { Suspense } from "react";
import { DynamicGreeting } from "@/components/layout/dynamic-greeting";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="grow flex flex-col py-16 px-20 min-h-screen bg-traced-bg overflow-y-auto">
      <div className="mb-16">
        <DynamicGreeting />
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

function LandingPage() {
  return (
    <div className="min-h-screen bg-traced-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl flex flex-col items-center gap-12">
        <h1 className="text-[80px] md:text-[120px] leading-[0.9] tracking-[-0.04em] text-traced-dark font-serif font-medium italic">
          Inkreel.
        </h1>
        
        <div className="flex flex-col gap-6">
          <p className="text-xl md:text-2xl font-serif italic text-traced-gray max-w-lg">
            A private personal media diary for the things you watch and read.
          </p>
          <div className="h-px w-24 bg-traced-accent mx-auto" />
          <p className="tracking-[0.2em] uppercase text-traced-gray font-sans text-[10px] font-bold">
            ARCHIVE YOUR CULTURAL JOURNEY
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link 
            href="/login" 
            className="bg-traced-dark text-white py-5 px-8 font-sans font-bold uppercase tracking-[0.2em] text-sm hover:bg-traced-accent transition-all duration-500 text-center"
          >
            Enter the Archive
          </Link>
          <p className="text-[10px] font-sans text-traced-gray uppercase tracking-widest">
            PRIVATE • SECURE • MINIMAL
          </p>
        </div>
      </div>
    </div>
  );
}

async function TrendingWatch() {
  try {
    const items = await getTrendingWatch(1).then(res => res.slice(0, 5));
    return <TrendingSection title="Watch" href="/watch" items={items} />;
  } catch (e) {
    console.error("TrendingWatch fetch failed:", e);
    return <TrendingSection title="Watch" href="/watch" items={[]} />;
  }
}

async function TrendingRead() {
  try {
    const items = await getTrendingBooks(0).then(res => res.slice(0, 5));
    return <TrendingSection title="Read" href="/read" items={items} />;
  } catch (e) {
    console.error("TrendingRead fetch failed:", e);
    return <TrendingSection title="Read" href="/read" items={[]} />;
  }
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
