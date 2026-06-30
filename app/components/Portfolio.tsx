"use client";
import { useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";
import { useAppData } from "../context/AppDataContext";
import Link from "next/link";

const fallbackPortfolio = [
  { id: "fb1", image: "/portfolio-wedding.png", title: "Pernikahan Elegan", category: "Wedding", settings: "ISO 100 • f/2.8 • 1/200s • 85mm" },
  { id: "fb2", image: "/portfolio-product.png", title: "Katalog Minimalis", category: "Produk", settings: "ISO 100 • f/8.0 • 1/160s • 90mm" },
  { id: "fb3", image: "/portfolio-fashion.png", title: "Musim Semi 2026", category: "Fashion", settings: "ISO 200 • f/2.0 • 1/400s • 50mm" },
  { id: "fb4", image: "/studio-rental.png", title: "Komersial Interior", category: "Arsitektur", settings: "ISO 64 • f/11.0 • 1/15s • 24mm" },
];

const CATEGORIES = ["Semua", "Wedding", "Produk", "Fashion", "Arsitektur"];

export default function Portfolio() {
  const { portfolio } = useAppData();
  const rawItems = portfolio && portfolio.length > 0 ? portfolio : fallbackPortfolio;
  
  // Mapped items with mock settings if not present
  const displayItems = rawItems.map((item, index) => ({
    ...item,
    settings: (item as any).settings || (fallbackPortfolio[index % 4]?.settings || "ISO 100 • f/2.8 • 1/250s • 50mm")
  }));

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeLightbox, setActiveLightbox] = useState<any>(null);

  // Filter items
  const filteredItems = displayItems.filter(item => {
    if (selectedCategory === "Semua") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <section id="galeri" className="py-24 bg-[#0D0E10] border-y border-neutral-900 relative overflow-hidden">
      {/* Decorative camera aperture graphic background */}
      <div className="absolute right-0 bottom-0 w-96 h-96 opacity-[0.02] text-white pointer-events-none translate-x-1/3 translate-y-1/3">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M50 5 L76.5 50 L95 50" stroke="currentColor" strokeWidth="0.5" />
          <path d="M95 50 L50 95 L50 76.5" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 95 L23.5 50 L5 50" stroke="currentColor" strokeWidth="0.5" />
          <path d="M5 50 L50 5 L50 23.5" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Reveal>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-orange-500 font-mono tracking-widest uppercase text-xs mb-3 block">GALERI KARYA</span>
            <h2 className="text-3xl md:text-5xl font-light text-white font-serif leading-tight">
              Karya Terbaik <span className="italic font-bold text-orange-500">Kami</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm max-w-md mx-auto">
              Arahkan kursor (atau ketuk pada layar ponsel) untuk menyimulasikan efek **Autofokus Kamera** dan melihat detail telemetri lensa.
            </p>
          </div>
        </Reveal>

        {/* Category Filters */}
        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border text-[10px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer rounded-none ${
                  selectedCategory === cat
                    ? "bg-orange-700 border-orange-700 text-white shadow-md shadow-orange-900/10"
                    : "bg-transparent border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredItems.slice(0, 4).map((item, i) => (
            <Reveal key={item.id || i} delay={i * 150} direction="up">
              <div 
                onClick={() => setActiveLightbox(item)}
                className="group relative aspect-square bg-[#121316] border border-neutral-800 viewfinder-box p-2 cursor-pointer transition-all duration-500 hover:border-emerald-600 lg:hover:-translate-y-1.5"
              >
                <div className="viewfinder-corners-bottom"></div>
                <div className="viewfinder-center text-orange-500 lg:group-hover:text-emerald-500 transition-colors duration-500"></div>

                <div className="w-full h-full relative overflow-hidden bg-neutral-950">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-all duration-700 filter grayscale-0 lg:grayscale lg:group-hover:grayscale-0 lg:group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Viewfinder rule of thirds grid lines (Desktop only to prevent mobile clutter) */}
                  <div className="hidden lg:grid grid-cols-3 grid-rows-3 absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10"></div>
                    <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/10"></div>
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/10"></div>
                  </div>

                  {/* Focus brackets and target simulation (Desktop only to avoid sticking on mobile tap) */}
                  <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-20">
                    {/* Left bracket */}
                    <span className="absolute w-2.5 h-4 border-y border-l border-white/30 group-hover:border-emerald-500 group-hover:-translate-x-1.5 transition-all duration-500 -translate-x-4"></span>
                    {/* Right bracket */}
                    <span className="absolute w-2.5 h-4 border-y border-r border-white/30 group-hover:border-emerald-500 group-hover:translate-x-1.5 transition-all duration-500 translate-x-4"></span>
                    {/* Center indicator dot */}
                    <span className="w-1.5 h-1.5 bg-white/40 group-hover:bg-emerald-500 rounded-full transition-colors duration-500 animate-pulse"></span>
                  </div>

                  {/* Telemetry info tag (Desktop only to prevent overlap) */}
                  <div className="hidden lg:flex absolute top-3 right-3 z-20 gap-2 text-[8px] font-mono tracking-wider text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-neutral-950/85 backdrop-blur-xs px-2 py-0.5 border border-neutral-800">
                    <span className="text-orange-500">AF-S</span>
                    <span>{item.settings.split(" • ")[0]}</span>
                    <span>{item.settings.split(" • ")[1]}</span>
                  </div>

                  {/* Category tag */}
                  <div className="absolute top-3 left-3 z-20 text-[8px] font-mono tracking-widest text-white bg-orange-700 px-2 py-0.5 uppercase">
                    {item.category}
                  </div>

                  {/* Hover Information overlay - visible on mobile by default, dynamic fade-in on desktop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 z-10">
                    <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight font-serif italic mt-0.5">{item.title}</h4>
                    <p className="text-[8px] text-slate-400 font-mono tracking-wider mt-1">{item.settings}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* View More button */}
        <Reveal delay={200}>
          <div className="mt-16 text-center">
            <Link href="/galeri" className="inline-block px-8 py-3.5 border border-white hover:bg-white text-white hover:text-[#0D0E10] font-mono uppercase text-xs tracking-widest transition-all duration-300 rounded-none cursor-pointer">
              Lihat Galeri Lengkap
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Lightbox / Modal Detail - Optimized for Mobile & Scrollable */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="bg-[#1A1C21] border border-neutral-800 viewfinder-box p-3 rounded-none max-w-4xl w-full relative flex flex-col md:flex-row my-8 max-h-none md:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="viewfinder-corners-bottom"></div>
            <div className="viewfinder-center text-orange-500"></div>

            {/* Image section */}
            <div className="relative w-full h-[45vh] md:h-auto md:flex-1 bg-neutral-950 min-h-[250px] md:min-h-[450px]">
              <Image
                src={activeLightbox.image}
                alt={activeLightbox.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Info section - Scrollable if content overflows on small heights */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#1A1C21] border-t md:border-t-0 md:border-l border-neutral-800 overflow-y-auto max-h-[40vh] md:max-h-none">
              <div>
                <span className="inline-block px-2.5 py-0.5 border border-neutral-800 text-[8px] font-mono uppercase tracking-widest text-orange-500 font-bold mb-3 md:mb-4">
                  {activeLightbox.category}
                </span>
                <h2 className="text-lg md:text-xl font-serif italic font-bold text-white leading-tight mb-2 md:mb-3">
                  {activeLightbox.title}
                </h2>
                <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed mb-4 md:mb-6">
                  {activeLightbox.description || "Karya visual premium yang didokumentasikan secara teliti menggunakan kamera bersensor penuh dan lensa prima kelas atas oleh tim fotografer profesional Fokus."}
                </p>
                
                {/* Meta details list */}
                <div className="space-y-2 pt-3 border-t border-neutral-800">
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-slate-500">
                    <span>Eksposur</span>
                    <span className="text-slate-300">{activeLightbox.settings}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-slate-500">
                    <span>Fotografer</span>
                    <span className="text-slate-300">Fokus Team</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Fokus Gallery</span>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="px-4 py-2 border border-neutral-800 font-mono text-[9px] uppercase tracking-widest text-slate-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer rounded-none"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Close button at top corner - Fixed positioning context relative to modal on mobile */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-30 p-2 bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
