export default function ItemLoading() {
  return (
    <div className="min-h-screen bg-bg text-dark selection:bg-accent selection:text-white pb-20 relative animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative h-[45vh] w-full bg-surface overflow-hidden" />

      <div className="max-w-[1200px] mx-auto px-10 -mt-40 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Poster Column Skeleton */}
          <aside className="w-72 flex-shrink-0 flex flex-col gap-10">
            <div className="relative aspect-[2/3] border-hairline bg-surface overflow-hidden shadow-2xl" />
            
            <div className="flex flex-col gap-8 py-8 border-t border-dark/10">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-2 pl-4">
                  <div className="h-2 w-12 bg-dark/5" />
                  <div className="h-5 w-24 bg-dark/10" />
                </div>
              ))}
            </div>
          </aside>

          {/* Content Column Skeleton */}
          <main className="flex-1 flex flex-col pt-40">
            <header className="mb-14 flex flex-col gap-4">
              <div className="h-8 w-24 bg-dark/5" />
              <div className="h-16 w-3/4 bg-dark/10" />
              <div className="h-6 w-1/2 bg-dark/5" />
            </header>

            <section className="mb-16">
              <div className="h-4 w-24 bg-dark/20 mb-6" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-dark/5" />
                <div className="h-4 w-full bg-dark/5" />
                <div className="h-4 w-2/3 bg-dark/5" />
              </div>
            </section>
          </main>

          {/* Action Sidebar Skeleton */}
          <aside className="w-full lg:w-72 pt-40">
            <div className="h-48 border-hairline bg-surface" />
          </aside>
        </div>
      </div>
    </div>
  );
}
