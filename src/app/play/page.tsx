import { getTrendingGames } from "@/lib/api/bgg";
import { FilteredMediaView } from "@/components/ui/filtered-media-view";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function PlayPage() {
  const trendingGames = await getTrendingGames();
  
  // Fetch user media for this category
  const playUserItems = await db.query.media.findMany({
    where: eq(media.type, "game"),
  });

  return (
    <div className="flex flex-col">
      {/* Sector Header (Match Artboard F8-1) */}
      <div className="flex flex-col relative pt-12 gap-0 px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <h1 className="[letter-spacing:-2px] text-[#2C2E2C] font-extrabold text-[46px] leading-[56px] m-0">
          Play
        </h1>
        <p className="text-[#8A8A7A] font-medium text-[16px] leading-[20px] m-0">
          Track board games, card games, and tabletop RPGs
        </p>
        {/* Exact Paper Blob (IH-1) */}
        <div 
          className="absolute -top-[30px] right-[80px] w-[160px] h-[140px] opacity-[0.08] bg-[#5B8CA8] -z-10" 
          style={{ 
            borderRadius: "40% 60% 50% 70% / 60% 40% 70% 50%" 
          }}
        />
      </div>

      <FilteredMediaView 
        initialItems={trendingGames}
        userItems={playUserItems}
        category="play"
      />
    </div>
  );
}
