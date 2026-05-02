import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { eq, or, and, desc, asc, ilike, gte, lte, ne } from "drizzle-orm";
import { FilterBar } from "@/components/item/filter-bar";
import { StoreInitializer } from "@/components/item/store-initializer";
import { DiaryGrid } from "@/components/diary/diary-grid";
import { DiaryTimeline } from "@/components/diary/diary-timeline";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DiarySearch } from "@/components/diary/diary-search";


interface ReadDiaryProps {
  searchParams: Promise<{ 
    filter?: string; 
    type?: string; 
    genre?: string;
    decade?: string;
    sort?: string;
    view?: string;
    q?: string;
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
    sort = "logged_desc",
    view = "grid",
    q = ""
  } = await searchParams;

  const conditions: any[] = [];
  
  // Base category and user filter
  conditions.push(eq(media.userId, session.user.id));
  conditions.push(ne(media.status, "none"));
  conditions.push(or(eq(media.type, "book"), eq(media.type, "manga")));

  // Search filter
  if (q) {
    conditions.push(or(
      ilike(media.title, `%${q}%`),
      ilike(media.creator, `%${q}%`)
    ));
  }

  // Type filter
  if (type !== "all") {
    conditions.push(eq(media.type, type));
  }

  // Genre filter
  if (genre !== "all") {
    conditions.push(ilike(media.genres, `%${genre}%`));
  }

  // Decade filter
  if (decade !== "all") {
    const startYear = parseInt(decade);
    conditions.push(gte(media.releaseYear, startYear));
    conditions.push(lte(media.releaseYear, startYear + 9));
  }

  // Sorting
  let orderBy: any[];
  if (sort === "logged_asc") {
    orderBy = [asc(media.createdAt), asc(media.id)];
  } else if (sort === "release_desc") {
    orderBy = [desc(media.releaseYear), asc(media.title), asc(media.id)];
  } else if (sort === "release_asc") {
    orderBy = [asc(media.releaseYear), asc(media.title), asc(media.id)];
  } else if (sort === "title_asc") {
    orderBy = [asc(media.title), asc(media.id)];
  } else {
    // Default: logged_desc
    orderBy = [desc(media.createdAt), desc(media.id)];
  }

  const readItems = await db.query.media.findMany({
    where: and(...conditions),
    orderBy: orderBy,
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
    <div className="flex min-h-screen bg-bg">
      <StoreInitializer items={readItems} />
      <div className="flex-1 flex flex-col pt-24">
        {/* Header Section */}
        <header className="px-12 mb-12 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl lg:text-7xl font-serif font-medium italic tracking-[-0.05em] leading-[0.9] m-0">
              Read.
            </h1>
            <div className="h-px grow bg-dark/10" />
          </div>
          <div className="flex items-end justify-between gap-12">
            <p className="text-xl font-serif italic opacity-40 max-w-xl">
              An archival log of your literary journeys and written archives.
            </p>
            <DiarySearch currentQuery={q} />
          </div>
        </header>

        {/* Sticky Filter Container */}
        <div className="flex flex-col pb-4 gap-4 px-12 border-b-hairline bg-bg sticky top-0 z-[100]">
          <FilterBar 
            genres={uniqueGenres}
            decades={uniqueDecades}
            currentFilters={{ filter, type, genre, decade, sort }}
            currentView={view}
            categoryLabel="Status"
            categoryOptions={[
              { label: "All", value: "all" },
              { label: "To Read", value: "shelf" },
              { label: "Reading", value: "reading" },
              { label: "Read", value: "completed" },
            ]}
            typeLabel="Format"
          />
        </div>

        {/* Items Grid */}
        <div className="flex flex-col px-12 py-8">
          {view === "timeline" ? (
            <DiaryTimeline
              initialItems={readItems}
              currentFilter={filter}
              category="read"
            />
          ) : (
            <DiaryGrid 
              initialItems={readItems} 
              currentFilter={filter} 
              category="read" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
