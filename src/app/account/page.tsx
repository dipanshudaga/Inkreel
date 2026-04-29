import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-traced-bg text-traced-dark selection:bg-traced-accent selection:text-white pb-20 pt-32 px-10">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        
        {/* Profile Centerpiece */}
        <div className="flex flex-col items-center gap-10">
          <div className="size-56 lg:size-72 rounded-full border-2 border-black bg-white overflow-hidden shadow-2xl">
            <img 
              src="/avatar.png" 
              alt={session.user?.name || "User"} 
              className="size-full object-cover mix-blend-multiply grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-6xl lg:text-8xl font-serif font-medium italic tracking-[-0.04em] leading-tight">
              {(session.user?.name || "Guest").charAt(0).toUpperCase() + (session.user?.name || "Guest").slice(1)}
            </h1>
          </div>

          <div className="mt-8">
            <SignOutButton />
          </div>
        </div>

        {/* Brand Mark (Subtle) */}
        <div className="mt-40 opacity-5 select-none pointer-events-none">
          <div className="text-[120px] font-serif italic tracking-tighter">INKREEL.</div>
        </div>

      </div>
    </div>
  );
}
