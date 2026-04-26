import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

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
      <body className="min-h-full flex flex-col font-sans selection:bg-traced-dark selection:text-traced-bg">
        {/* <Navbar /> We will replace this with Sidebar later */}
        <main className="flex-1 relative z-10 w-full mb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
