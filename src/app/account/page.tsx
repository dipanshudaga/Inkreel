import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { ProfileForm } from "./profile-form";
import { GoalsForm } from "./goals-form";
import { db } from "@/lib/db";
import { media, users } from "@/lib/db/schema";
import { Download, Trash2 } from "lucide-react";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { ArchiveActions } from "./archive-actions";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch full user data including the new name field
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  if (!user) redirect("/login");

  // Fetch stats for the current year
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const stats = await db.select({
    category: media.category,
    count: sql<number>`count(*)::int`,
  })
  .from(media)
  .where(
    and(
      eq(media.userId, user.id),
      eq(media.status, "completed"),
      gte(media.completedAt, startOfYear),
      lte(media.completedAt, endOfYear)
    )
  )
  .groupBy(media.category);

  const completedMovies = stats.find(s => s.category === 'watch')?.count || 0;
  const completedBooks = stats.find(s => s.category === 'read')?.count || 0;

  return (
    <div className="min-h-screen bg-bg text-dark selection:bg-accent selection:text-white pb-20 pt-24 px-10">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <header className="mb-20 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl lg:text-7xl font-serif font-medium italic tracking-[-0.05em] leading-[0.9] m-0">
              Account.
            </h1>
            <div className="h-px grow bg-dark/10" />
          </div>
          <p className="text-xl font-serif italic opacity-40 max-w-xl">
            Control your digital parameters and manage your private archive.
          </p>
        </header>

        {/* Main Content Area: Flipped Split Screen */}
        <div className="flex flex-col lg:flex-row bg-white/5">
          
          {/* Left Column: The Ledger */}
          <div className="w-full lg:w-[60%] flex flex-col lg:border-r-hairline">
            {/* Section 01: Progress & Goals */}
            <div className="p-10 lg:p-14 flex flex-col gap-12 border-b-hairline">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-serif italic">Yearly Objectives</h2>
              </div>

              <GoalsForm 
                currentMovieGoal={user.movieGoal} 
                currentBookGoal={user.bookGoal}
                completedMovies={completedMovies}
                completedBooks={completedBooks}
              />
            </div>

            {/* Section 02: Settings */}
            <div className="p-10 lg:p-14 flex flex-col gap-12 border-b-hairline bg-surface/5">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-serif italic">Profile</h2>
              </div>
              <div className="w-full">
                <ProfileForm currentUsername={user.username} currentName={user.name || ""} />
              </div>
            </div>

            {/* Section 03: Archive */}
            <div className="p-10 lg:p-14 flex flex-col gap-12">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-serif italic">Controls</h2>
              </div>
              
              <ArchiveActions />
            </div>
          </div>

          {/* Right Column: Identity Hero */}
          <div className="w-full lg:w-[40%] p-10 lg:p-14 flex flex-col gap-12 sticky top-24 self-start">
            <div className="flex flex-col gap-10">
              <div className="size-48 rounded-full border-hairline bg-surface overflow-hidden shrink-0">
                <img 
                  src="/avatar.png" 
                  alt={user.name || user.username} 
                  className="size-full object-cover transition-all duration-700 rounded-full"
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl lg:text-5xl font-serif font-medium italic tracking-[-0.05em] leading-[0.9] m-0">
                  {(user.name || user.username)}
                </h1>
                <div className="flex flex-col gap-1 opacity-40">
                  <span className="text-sm uppercase tracking-[0.2em] font-sans font-bold">Member since 2016</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 border-t-hairline lg:border-t-0">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
