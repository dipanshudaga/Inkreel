import { Newsreader, Space_Grotesk } from "next/font/google";
import dns from "dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
import "./globals.css";
import { Suspense } from "react";
import { RootContent } from "@/components/layout/root-content";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "Inkreel.",
  description: "A private personal media diary.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex font-sans selection:bg-traced-dark selection:text-traced-bg"
        suppressHydrationWarning
      >
        {/* 
          In Next.js 16, wrapping dynamic server components in Suspense 
          at the root prevents "Blocking Route" warnings and improves TBT.
        */}
        <Suspense fallback={<div className="flex-1 bg-traced-bg animate-pulse" />}>
          <RootContent>
            {children}
          </RootContent>
        </Suspense>
      </body>
    </html>
  );
}
