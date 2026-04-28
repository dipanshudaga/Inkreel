import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or, and, desc, asc, like, gte, lte } from "drizzle-orm";
import { FilterBar } from "@/components/item/filter-bar";
import { StoreInitializer } from "@/components/item/store-initializer";
import { DiaryGrid } from "@/components/diary/diary-grid";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";


interface ReadDiaryProps {
  searchParams: Promise<{ 
    filter?: string; 
    type?: string; 
    genre?: string;
    decade?: string;
    sort?: string;
  }>;
}

export default async function ReadDiary({ searchParams }: ReadDiaryProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { 
    filter = "all", 
    type = "all", 
    genre = "all",
    decade = "all",
    sort = "logged_desc" 
  } = await searchParams;

  const conditions: any[] = [];
  
  // Base category and user filter
  conditions.push(eq(media.userId, session.user.id));
  conditions.push(or(eq(media.type, "book"), eq(media.type, "manga")));

  // Type filter
  if (type !== "all") {
    conditions.push(eq(media.type, type));
  }

  // Genre filter
  if (genre !== "all") {
    conditions.push(like(media.genres, `%${genre}%`));
  }

  // Decade filter
  if (decade !== "all") {
    const startYear = parseInt(decade);
    conditions.push(gte(media.releaseYear, startYear));
    conditions.push(lte(media.releaseYear, startYear + 9));
  }

  // Sorting
  let orderBy: any = desc(media.id);
  if (sort === "release_desc") orderBy = desc(media.releaseYear);
  else if (sort === "release_asc") orderBy = asc(media.releaseYear);
  else if (sort === "title_asc") orderBy = asc(media.title);

  const readItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: [orderBy],
  });

  // Fetch all user's genres and decades for filter options
  const allUserMedia = await db.query.media.findMany({
    where: and(
      eq(media.userId, session.user.id),
      or(eq(media.type, "book"), eq(media.type, "manga"))
    ),
    columns: { genres: true, releaseYear: true }
  });

  const uniqueGenres = [...new Set(allUserMedia.flatMap(m => m.genres?.split(',').map(g => g.trim()) || []))].filter(Boolean).sort();
  const uniqueYears = [...new Set(allUserMedia.map(m => m.releaseYear).filter(Boolean) as number[])].sort((a, b) => b - a);
  const uniqueDecades = [...new Set(uniqueYears.map(y => Math.floor(y / 10) * 10))].map(d => `${d}s`);

  return (
    <div className="flex min-h-screen bg-traced-bg">
      <StoreInitializer items={readItems} />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col pt-8 pb-4 gap-4 px-12 border-b-hairline bg-traced-bg sticky top-0 z-50">
          <h1 className="tracking-[-0.04em] text-traced-dark font-serif font-medium text-4xl m-0 italic">
            Read Diary
          </h1>
          
          <FilterBar 
            genres={uniqueGenres}
            decades={uniqueDecades}
            currentFilters={{ filter, type, genre, decade, sort }}
            categoryLabel="Shelf"
            typeLabel="Format"
          />
        </div>

        {/* Items Grid */}
        <div className="flex flex-col px-12 py-8">
          <DiaryGrid 
            initialItems={readItems} 
            currentFilter={filter} 
            category="read" 
          />
        </div>
      </div>
    </div>
  );
}
