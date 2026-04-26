'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-traced-bg p-8 text-center">
      <div className="max-w-md w-full bg-white border border-[#1A1A1A] p-12 shadow-xl">
        <h2 className="text-4xl font-serif font-medium text-traced-dark mb-6">Something went wrong</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 text-left">
          <p className="text-sm text-red-700 font-mono break-all">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <p className="text-[#737373] font-sans text-sm mb-10 uppercase tracking-widest leading-relaxed">
          This is likely a connection issue with the database. Please check your credentials and network settings.
        </p>
        <button
          onClick={() => reset()}
          className="w-full h-14 bg-traced-dark text-white font-sans text-[13px] uppercase tracking-[0.2em] font-semibold hover:bg-black transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
