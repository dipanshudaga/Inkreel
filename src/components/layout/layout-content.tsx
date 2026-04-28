"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function LayoutContent({ 
  children, 
  serverSession 
}: { 
  children: React.ReactNode,
  serverSession?: any 
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Use server session for initial render to avoid hydration mismatch
  const currentSession = session || serverSession;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const showSidebar = currentSession && !isAuthPage;

  return (
    <>
      {showSidebar && <Sidebar />}
      <main className={cn(
        "flex-1 relative z-10 w-full transition-all duration-300",
        showSidebar ? "ml-[288px]" : "ml-0"
      )}>
        {children}
      </main>
    </>
  );
}
