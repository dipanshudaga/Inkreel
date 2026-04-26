import { getTrendingWatch } from "@/lib/api/tmdb";
import { FilteredMediaView } from "@/components/ui/filtered-media-view";
import { db } from "@/lib/db";

export default async function WatchPage() {
  const trendingWatch = await getTrendingWatch();
  
  // Fetch user tracking data for this category
  const userEntries = await db.query.trackingEntries.findMany({
    with: {
      media: true,
    },
  });

  const watchUserEntries = userEntries.filter(entry => entry.media?.category === "watch");

  return (
    <div className="flex flex-col">
      {/* Sector Header (Match Artboard 9F-0) */}
      <div className="flex flex-col relative pt-12 gap-0 px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <h1 className="[letter-spacing:-2px] text-[#2C2E2C] font-extrabold text-[46px] leading-[56px] m-0">
          Watch
        </h1>
        <p className="text-[#8A8A7A] font-medium text-[16px] leading-[20px] m-0">
          Track movies, series, Anime in one place
        </p>
        {/* Exact Paper Blob (9V-1) */}
        <div 
          className="absolute -top-[40px] right-[60px] w-[180px] h-[160px] opacity-[0.07] bg-[#E8643B] -z-10" 
          style={{ 
            borderRadius: "50% 60% 40% 70% / 60% 50% 70% 40%" 
          }}
        />
      </div>

      <FilteredMediaView 
        initialItems={trendingWatch}
        userItems={watchUserEntries}
        category="watch"
      />
    </div>
  );
}
