import { getTrendingWatch } from "@/lib/api/tmdb";
import { getTrendingBooks } from "@/lib/api/google-books";
import Link from "next/link";
import { Suspense } from "react";
import { DynamicGreeting } from "@/components/layout/dynamic-greeting";
import { auth } from "@/lib/auth";
import { MediaCard } from "@/components/item/media-card";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="grow flex flex-col py-16 px-20 min-h-screen bg-bg overflow-y-auto">
      <div className="mb-16">
        <DynamicGreeting />
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-12 bg-accent" />
          <p className="tracking-[0.1em] uppercase text-gray font-sans text-xs font-medium">
            Personal Media Diary
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <TrendingWatch />
        <TrendingRead />
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl flex flex-col items-center gap-12">
        <h1 className="text-[80px] md:text-[120px] leading-[0.9] tracking-[-0.04em] text-dark font-serif font-medium italic">
          Inkreel.
        </h1>
        
        <div className="flex flex-col gap-6">
          <p className="text-xl md:text-2xl font-serif italic text-gray max-w-lg">
            A private personal media diary for the things you watch and read.
          </p>
          <div className="h-px w-24 bg-accent mx-auto" />
          <p className="tracking-[0.2em] uppercase text-gray font-sans text-[10px] font-medium">
            LOG YOUR CULTURAL JOURNEY
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link 
            href="/login" 
            className="bg-dark text-white py-5 px-8 font-sans font-medium uppercase tracking-[0.2em] text-sm hover:bg-accent transition-all duration-500 text-center"
          >
            Enter the Diary
          </Link>
          <p className="text-[10px] font-sans text-gray uppercase tracking-widest">
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
    return <TrendingSection title="Watch" href="/watch" items={items} category="watch" />;
  } catch (e) {
    console.error("TrendingWatch fetch failed:", e);
    return <TrendingSection title="Watch" href="/watch" items={[]} category="watch" />;
  }
}

async function TrendingRead() {
  try {
    const items = await getTrendingBooks(0).then(res => res.slice(0, 5));
    return <TrendingSection title="Read" href="/read" items={items} category="read" />;
  } catch (e) {
    console.error("TrendingRead fetch failed:", e);
    return <TrendingSection title="Read" href="/read" items={[]} category="read" />;
  }
}

function TrendingSection({ title, href, items, category }: { title: string, href: string, items: any[], category: "watch" | "read" }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b-hairline pb-4">
        <h2 className="text-2xl font-serif font-medium text-dark italic m-0">{title}</h2>
        <Link href={href} className="text-xs font-sans uppercase tracking-widest text-gray hover:text-dark transition-colors font-medium">
          View Your Diary
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
        {items.map((item: any) => (
          <MediaCard 
            key={item.id} 
            item={{
              ...item,
              category
            }} 
            variant="diary"
          />
        ))}
      </div>
    </div>
  );
}

function SectionSkeleton({ title, href }: { title: string, href: string }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <h2 className="text-2xl font-serif font-medium text-dark italic m-0 opacity-50">{title}</h2>
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
