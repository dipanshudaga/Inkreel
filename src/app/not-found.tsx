import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-vault-bg flex flex-col items-center justify-center text-center p-4">
      <div className="flex flex-col gap-6 max-w-lg">
        <h1 className="text-[120px] font-black text-white/5 leading-none tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          404
        </h1>
        <div className="relative z-10 flex flex-col gap-8">
          <div className="h-1 bg-letterboxd-green w-24 mx-auto" />
          <div className="flex flex-col gap-2">
            <h2 className="text-[56px] font-black text-white uppercase italic tracking-tighter leading-tight">
              Lost in the Vault
            </h2>
            <p className="text-[18px] text-text-muted font-medium leading-relaxed">
              The record you're seeking hasn't been archived yet, or it's currently hidden in a deep digital pocket.
            </p>
          </div>
          <Link 
            href="/" 
            className="notion-btn-primary h-14 w-fit mx-auto px-10 rounded-xl text-md font-black italic shadow-2xl transition-all"
          >
            Return to Core
          </Link>
        </div>
      </div>
    </div>
  );
}
