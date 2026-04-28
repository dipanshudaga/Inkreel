import { Newsreader, Space_Grotesk } from "next/font/google";
import dns from "dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
import "./globals.css";
import { SearchModal } from "@/components/layout/search-modal";
import { Agentation } from "agentation";
import { Providers } from "@/components/layout/providers";
import { Suspense } from "react";
import { LayoutContent } from "@/components/layout/layout-content";
import { auth } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch session on the server to prevent hydration mismatch in LayoutContent
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex font-sans selection:bg-traced-dark selection:text-traced-bg">
        <Providers session={session}>
          <LayoutContent serverSession={session}>
            {children}
          </LayoutContent>
          <SearchModal />
          <Agentation />
        </Providers>
      </body>
    </html>
  );
}
