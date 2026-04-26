import { getTrendingWatch } from "@/lib/api/tmdb";
import { getTrendingBooks } from "@/lib/api/google-books";
import { getTrendingGames } from "@/lib/api/bgg";
import { MediaCard } from "@/components/ui/media-card";
import Link from "next/link";

export default async function Home() {
  const [trendingWatch, trendingBooks, trendingGames] = await Promise.all([
    getTrendingWatch(),
    getTrendingBooks(),
    getTrendingGames()
  ]);

  return (
    <div className="flex flex-col w-full bg-[#FBF8F0] antialiased">
      {/* Hero Section */}
      <div className="flex flex-col items-center relative pt-20 pb-15 overflow-clip px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        {/* Exact Paper Background Blobs */}
        <div className="absolute -top-15 -right-10 w-[320px] h-[280px] opacity-[0.12] rounded-tl-[50%_60%] rounded-tr-[60%_50%] rounded-br-[40%_70%] rounded-bl-[70%_40%] bg-[#E8643B] -z-10" />
        <div className="absolute -bottom-7.5 -left-5 w-[240px] h-[200px] opacity-[0.1] rounded-tl-[60%_40%] rounded-tr-[40%_60%] rounded-br-[50%_70%] rounded-bl-[70%_50%] bg-[#7BA668] -z-10" />
        
        <div className="flex flex-col items-center max-w-[800px] relative gap-6">
          <div className="text-[48px] md:text-[72px] [letter-spacing:-3px] leading-[0.95] text-center text-[#2C2E2C] font-extrabold m-0 text-balance">
            Log your movies, books and games all in one place.
          </div>
          <div className="text-[18px] leading-[1.6] max-w-[520px] text-center text-[#8A8A7A] font-medium">
            The personal vault for your cinematic, literary, and ludic history. Track, rate, review.
          </div>
          <div className="flex mt-2 gap-3">
            <div className="rounded-full py-3.5 px-8 bg-[#2C2E2C] cursor-pointer hover:opacity-90 transition-opacity">
              <div className="text-center text-[#FBF8F0] font-bold text-[15px]">
                Log now
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="h-px bg-[#2C2E2C14]" />
      </div>

      {/* Watch Section */}
      <div className="flex flex-col pt-12 gap-6 px-6 lg:px-20 max-w-[1440px] mx-auto w-full mb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-[#E8643B] shrink-0 w-7 h-7">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <div className="[letter-spacing:-0.5px] inline-block text-[#2C2E2C] font-extrabold text-[22px]">
              Watch
            </div>
          </div>
          <Link href="/watch" className="inline-block text-[#8A8A7A] font-semibold text-sm hover:text-[#2C2E2C] transition-colors">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
          {trendingWatch.slice(0, 5).map((item: any) => (
            <MediaCard 
              key={`watch-${item.id}`}
              {...item}
              subtitle={`${item.year} · ${item.subType?.charAt(0).toUpperCase() + item.subType?.slice(1)}`}
            />
          ))}
        </div>
      </div>

      {/* Read Section */}
      <div className="flex flex-col pt-12 gap-6 px-6 lg:px-20 max-w-[1440px] mx-auto w-full mb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-[#D4A843] shrink-0 w-7 h-7">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div className="[letter-spacing:-0.5px] inline-block text-[#2C2E2C] font-extrabold text-[22px]">
              Read
            </div>
          </div>
          <Link href="/read" className="inline-block text-[#8A8A7A] font-semibold text-sm hover:text-[#2C2E2C] transition-colors">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
          {trendingBooks.slice(0, 5).map((item: any) => (
             <MediaCard 
              key={`read-${item.id}`}
              {...item}
              subtitle={`${item.year} · ${item.subType?.charAt(0).toUpperCase() + item.subType?.slice(1)}`}
             />
          ))}
        </div>
      </div>

      {/* Play Section */}
      <div className="flex flex-col pt-12 pb-24 gap-6 px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg bg-[#5B8CA8] shrink-0 w-7 h-7">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="[letter-spacing:-0.5px] inline-block text-[#2C2E2C] font-extrabold text-[22px]">
              Play
            </div>
          </div>
          <Link href="/play" className="inline-block text-[#8A8A7A] font-semibold text-sm hover:text-[#2C2E2C] transition-colors">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
          {trendingGames.slice(0, 5).map((item: any) => (
             <MediaCard 
              key={`play-${item.id}`}
              {...item}
              subtitle={`${item.year} · ${item.subType?.split('_').map((w:string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
             />
          ))}
        </div>
      </div>
    </div>
  );
}
