import { getTrendingBooks } from "@/lib/api/google-books";
import { FilteredMediaView } from "@/components/ui/filtered-media-view";
import { db } from "@/lib/db";
import { ChevronRight } from "lucide-react";

export default async function ReadPage() {
  const trendingBooks = await getTrendingBooks();
  
  // Fetch user tracking data for this category
  const userEntries = await db.query.trackingEntries.findMany({
    with: {
      media: true,
    },
  });

  const readUserEntries = userEntries.filter(entry => entry.media?.category === "read");
  const myShelf = readUserEntries.filter(entry => entry.status === "in_progress");

  return (
    <div className="flex flex-col">
      {/* Sector Header (Match Artboard 9G-0) */}
      <div className="flex flex-col relative pt-12 gap-0 px-6 lg:px-20 max-w-[1440px] mx-auto w-full">
        <h1 className="[letter-spacing:-2px] text-[#2C2E2C] font-extrabold text-[46px] leading-[56px] m-0">
          Read
        </h1>
        <p className="text-[#8A8A7A] font-medium text-[16px] leading-[20px] m-0">
          Track books, manga, comics in one place
        </p>
        {/* Exact Paper Blob (BU-1) */}
        <div 
          className="absolute -top-[30px] right-[80px] w-[160px] h-[140px] opacity-[0.08] bg-[#D4A843] -z-10" 
          style={{ 
            borderRadius: "60% 40% 50% 70% / 40% 60% 70% 50%" 
          }}
        />
      </div>

      {/* My Shelf (Active Reading) */}
      {myShelf.length > 0 && (
        <section className="flex flex-col gap-6 vault-container mt-4 mb-4">
          <div className="flex items-center gap-2 group cursor-pointer w-fit">
            <h2 className="text-[18px] font-bold tracking-tight text-vault-dark">Currently Reading</h2>
            <ChevronRight className="h-4 w-4 text-vault-gray group-hover:text-vault-dark transition-colors" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myShelf.map((entry) => (
              <div key={entry.id} className="p-4 flex gap-4 rounded-xl border border-vault-dark/10 bg-white hover:shadow-sm transition-shadow">
                <div className="h-24 w-16 overflow-hidden rounded-[8px] bg-[#EBE4D6] flex-shrink-0">
                   <img src={entry.media?.posterUrl || ""} alt={entry.media?.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-1 w-full">
                  <h3 className="text-[14px] font-bold text-vault-dark line-clamp-1">{entry.media?.title}</h3>
                  <div className="w-full h-1.5 bg-vault-dark/5 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-vault-read" 
                      style={{ width: `${(entry.progress! / entry.totalExpected!) * 100}%` }} 
                    />
                  </div>
                  <span className="text-[11px] text-vault-gray font-semibold mt-1">
                    {entry.progress} / {entry.totalExpected} Pages
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <FilteredMediaView 
        initialItems={trendingBooks}
        userItems={readUserEntries}
        category="read"
      />
    </div>
  );
}
