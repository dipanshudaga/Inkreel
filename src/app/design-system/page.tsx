"use client";

import { Search, Plus, ArrowRight, User, BookOpen, Film, Tv, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-traced-bg text-traced-dark p-12 md:p-24 selection:bg-traced-accent selection:text-white">
      {/* Header */}
      <header className="mb-32 border-b-2 border-traced-dark pb-12">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40 mb-4 block">Specification v1.0</span>
        <h1 className="text-8xl md:text-9xl font-serif italic tracking-tighter leading-none">
          Inkreel<br />Design System
        </h1>
        <p className="mt-8 text-2xl font-serif italic opacity-60 max-w-2xl leading-relaxed">
          A high-editorial digital archive built on the principles of Swiss Grid Design and Print-Inspired Minimalism.
        </p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Tokens */}
        <aside className="lg:col-span-4 space-y-24">
          
          {/* Colors */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 border-b border-traced-dark/10 pb-2">Color Palette</h3>
            <div className="space-y-4">
              <ColorRow name="Traced BG" hex="#F7F5F0" usage="Primary Canvas" />
              <ColorRow name="Traced Surface" hex="#EBE8DE" usage="Structural Blocks" />
              <ColorRow name="Traced Dark" hex="#1A1A1A" usage="Typography & Borders" />
              <ColorRow name="Traced Gray" hex="#666666" usage="Secondary Metadata" />
              <ColorRow name="Traced Accent" hex="#DE3C26" usage="Critical CTAs" />
            </div>
          </section>

          {/* Typography */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 border-b border-traced-dark/10 pb-2">Typography</h3>
            <div className="space-y-12">
              <div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mb-4">Editorial Serif</p>
                <p className="text-5xl font-serif italic">Newsreader</p>
                <p className="mt-2 text-sm opacity-60">Used for titles, hero statements, and long-form reviews.</p>
              </div>
              <div>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mb-4">Technical Sans</p>
                <p className="text-4xl font-sans font-medium uppercase tracking-tighter">Space Grotesk</p>
                <p className="mt-2 text-sm opacity-60">Used for UI elements, labels, and technical data.</p>
              </div>
            </div>
          </section>

          {/* Icons */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 border-b border-traced-dark/10 pb-2">Iconography</h3>
            <div className="grid grid-cols-5 gap-4">
              {[Search, Plus, ArrowRight, User, BookOpen, Film, Tv, Clock, ExternalLink].map((Icon, i) => (
                <div key={i} className="aspect-square border-hairline flex items-center justify-center bg-white/50">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </section>

        </aside>

        {/* Right Column: Components */}
        <main className="lg:col-span-8 space-y-32">
          
          {/* Buttons */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12 border-b border-traced-dark/10 pb-2">Component: Buttons</h3>
            <div className="flex flex-wrap gap-8 items-end">
              <div className="space-y-4">
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Accent CTA</p>
                <button className="bg-traced-accent text-white px-10 py-5 text-[11px] uppercase tracking-[0.3em] font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">
                  Confirm & Sync
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Secondary</p>
                <button className="border-2 border-traced-dark px-10 py-[18px] text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-traced-dark hover:text-white transition-all">
                  View Archive
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Ghost</p>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:text-traced-accent transition-colors">
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12 border-b border-traced-dark/10 pb-2">Component: Media Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Default State (Grayscale)</p>
                <div className="group relative aspect-[2/3] w-full max-w-[240px] bg-traced-surface border-hairline overflow-hidden cursor-pointer">
                   <div className="absolute inset-0 bg-neutral-400 grayscale transition-all duration-700 group-hover:grayscale-0" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-white font-serif italic text-2xl">The Godfather</p>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">1972 • Movie</p>
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] opacity-40 uppercase tracking-widest">Import View</p>
                <div className="flex items-center gap-6 p-4 bg-white border-hairline w-full max-w-sm">
                   <div className="h-24 w-16 bg-traced-surface border-hairline" />
                   <div className="flex flex-col gap-1">
                      <p className="text-xl font-serif italic">Brave New World</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-traced-gray">Aldous Huxley • 1932</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold text-traced-accent">
                         <span className="size-1.5 rounded-full bg-traced-accent animate-pulse" /> Ready to sync
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Elements */}
          <section>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-12 border-b border-traced-dark/10 pb-2">Component: Inputs</h3>
            <div className="max-w-md space-y-12">
               <div className="space-y-4">
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Editorial Search</p>
                  <input 
                    type="text" 
                    placeholder="Search the archive..." 
                    className="w-full bg-transparent border-b-2 border-traced-dark pb-4 text-4xl font-serif italic focus:outline-none placeholder:opacity-10"
                  />
               </div>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-48 pt-12 border-t border-traced-dark/10 flex justify-between items-center text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
        <p>© 2026 Inkreel Archive</p>
        <p>Built for the Curated Life</p>
      </footer>
    </div>
  );
}

function ColorRow({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div 
        className="size-12 border-hairline group-hover:scale-110 transition-transform" 
        style={{ backgroundColor: hex }} 
      />
      <div className="flex-1 border-b border-traced-dark/5 py-2">
        <div className="flex justify-between items-baseline">
          <span className="font-sans font-bold text-[11px] uppercase tracking-widest">{name}</span>
          <span className="font-sans text-[10px] opacity-40 uppercase">{hex}</span>
        </div>
        <p className="text-[10px] italic opacity-60 font-serif">{usage}</p>
      </div>
    </div>
  );
}
