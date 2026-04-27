import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchModal } from "@/components/layout/search-modal";
import { Agentation } from "agentation";

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
  title: "Traced.",
  description: "A local-first personal media database.",
};

import { QuickLogModal } from "@/components/layout/quick-log-modal";
import { LogModal } from "@/components/ui/log-modal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex font-sans selection:bg-traced-dark selection:text-traced-bg">
        <Sidebar />
        <main className="flex-1 relative z-10 w-full ml-[288px]">
          {children}
        </main>
        <SearchModal />
        <QuickLogModal />
        <LogModal />
        <Agentation />
      </body>
    </html>
  );
}
