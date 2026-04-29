import { Suspense } from "react";
import { LoginForm } from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6 selection:bg-[#1A1A1A] selection:text-[#F5F2ED]">
      <div className="max-w-md w-full flex flex-col gap-10">
        <header className="text-center">
          <h1 className="text-[48px] font-serif italic text-[#1A1A1A] leading-none mb-4">
            Inkreel.
          </h1>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#737373]">
            Your Personal Media Diary
          </p>
        </header>

        <main className="bg-[#EBE7DF] border border-[#1A1A1A] p-12 shadow-sm">
          <Suspense fallback={<div className="h-64 flex items-center justify-center font-serif italic opacity-30">Opening...</div>}>
            <LoginForm />
          </Suspense>

          <footer className="mt-12 text-center">
            <Link 
              href="/signup" 
              className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#737373] hover:text-[#1A1A1A] transition-colors"
            >
              Don't have an account? Join
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
