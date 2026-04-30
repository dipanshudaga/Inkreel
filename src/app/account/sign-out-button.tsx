"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 py-4 px-10 border-hairline hover:bg-dark hover:text-white transition-all cursor-pointer group"
    >
      <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
      <span className="text-xs uppercase tracking-[0.2em] font-medium">Exit Diary</span>
    </button>
  );
}
