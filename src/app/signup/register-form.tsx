"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/lib/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to create account");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {error && (
        <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-red-600 text-center">{error}</p>
      )}

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#737373]">Full Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full bg-white border border-[#1A1A1A] h-14 px-4 font-sans text-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#737373]">Username</label>
          <input
            name="username"
            type="text"
            required
            className="w-full bg-white border border-[#1A1A1A] h-14 px-4 font-sans text-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-[#737373]">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full bg-white border border-[#1A1A1A] h-14 px-4 font-sans text-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-[#8C8C8C] text-white font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#1A1A1A] transition-all disabled:opacity-50"
      >
        {loading ? "Cataloging..." : "Create Identity"}
      </button>
    </form>
  );
}
