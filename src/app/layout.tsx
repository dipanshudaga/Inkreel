import { Newsreader, Space_Grotesk } from "next/font/google";
import dns from "dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
import "./globals.css";
import { Suspense } from "react";
import { RootContent } from "@/components/layout/root-content";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata = {
  title: "Inkreel.",
  description: "A private personal media diary.",
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = "cream";
  const font = "serif";

  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} h-full antialiased transition-colors duration-700`}
      data-theme={theme}
      data-font={font}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex font-sans selection:bg-dark selection:text-bg"
        suppressHydrationWarning
      >
        {/* 
          In Next.js 16, wrapping dynamic server components in Suspense 
          at the root prevents "Blocking Route" warnings and improves TBT.
        */}
        <Suspense fallback={<div className="flex-1 bg-bg animate-pulse" />}>
          <RootContent>
            {children}
          </RootContent>
        </Suspense>
      </body>
    </html>
  );
}
