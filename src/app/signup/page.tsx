import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 selection:bg-dark selection:text-bg">
      <div className="max-w-md w-full flex flex-col gap-10">
        <header className="text-center">
          <h1 className="text-[48px] font-serif italic text-dark leading-none mb-4">
            Join Inkreel
          </h1>
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-gray">
            Start Your Personal Media Diary
          </p>
        </header>

        <main className="bg-surface border-hairline p-12 shadow-sm">
          <Suspense fallback={<div className="h-64 flex items-center justify-center font-serif italic opacity-30">Opening...</div>}>
            <RegisterForm />
          </Suspense>

          <footer className="mt-12 text-center">
            <Link 
              href="/login" 
              className="text-[10px] font-sans font-medium uppercase tracking-[0.1em] text-gray hover:text-dark transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
