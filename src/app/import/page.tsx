import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportClient } from "./import-client";

export default async function ImportPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-traced-bg text-traced-dark selection:bg-traced-accent selection:text-white pb-20 pt-24 px-10">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <header className="mb-20 flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <h1 className="text-7xl lg:text-[100px] font-serif font-medium italic tracking-[-0.05em] leading-[0.8] m-0">
              Import.
            </h1>
            <div className="h-px grow bg-traced-dark/10" />
          </div>
          <p className="text-xl font-serif italic opacity-40 max-w-xl">
            Migrate your collection from external ecosystems into your private diary.
          </p>
        </header>

        <ImportClient />

      </div>
    </div>
  );
}
