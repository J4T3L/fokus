"use client";

import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Image from "next/image";

const CATEGORIES = ["Semua", "Video 30s", "Wedding", "Prewedding", "Produk", "Fashion", "Portrait", "Event"];

export default function PublicGalleryPage() {
  const { portfolio } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLightbox, setActiveLightbox] = useState<any>(null);

  // Filter items
  const filteredItems = portfolio.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const isVideoItem = (item: any) => {
    if (!item || !item.image) return false;
    return (
      item.category === "Video 30s" ||
      item.image.match(/\.(mp4|webm|mov|mkv)$/i)
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Reveal direction="up">
              <span className="text-orange-700 font-mono tracking-widest uppercase text-xs mb-3 block">
                GALERI KARYA &amp; VIDEO REELS
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 font-serif leading-tight">
                Inspirasi Momen, Foto &amp; <span className="italic font-bold text-orange-700">Video 30s</span>
              </h1>
              <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
                Jelajahi portofolio fotografi dan cuplikan video sinematik 30 detik yang kami hasilkan dengan kualitas terbaik.
              </p>
            </Reveal>
          </div>

          {/* Search and Filters Section */}
          <Reveal direction="up" delay={150}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white p-6 border border-neutral-200 viewfinder-box rounded-none relative">
              <div className="viewfinder-corners-bottom"></div>
              <div className="viewfinder-center text-orange-600"></div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 border text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                      selectedCategory === cat
                        ? "bg-orange-700 border-orange-700 text-white"
                        : "bg-white border-neutral-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {cat === "Video 30s" ? "📹 Video 30s" : cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[280px]">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="CARI NAMA KARYA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-3 py-2.5 border border-neutral-300 bg-white font-mono text-[10px] tracking-wider focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                />
              </div>
            </div>
          </Reveal>

          {/* Gallery Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-200">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest font-mono mb-1">Tidak ada karya ditemukan</h3>
              <p className="text-slate-400 text-xs">Coba ubah filter kategori atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, i) => {
                const isVid = isVideoItem(item);

                return (
                  <Reveal key={item.id} delay={i * 80} direction="up">
                    <div
                      onClick={() => setActiveLightbox(item)}
                      className="group relative border border-neutral-200 viewfinder-box p-3 bg-white rounded-none aspect-[4/3] cursor-pointer"
                    >
                      <div className="viewfinder-corners-bottom"></div>
                      <div className="viewfinder-center text-orange-600"></div>

                      <div className="relative w-full h-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                        {isVid ? (
                          <>
                            <video
                              src={item.image}
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Play Overlay Icon */}
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              <div className="w-12 h-12 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300"></div>

                        {/* Telemetri tags */}
                        <div className="absolute top-3 left-3 z-20 text-[8px] font-mono tracking-widest text-white bg-black/55 px-2 py-0.5 uppercase flex items-center gap-1">
                          {isVid ? "📹 VIDEO 30S" : item.category}
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 w-full p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 z-20">
                          <h3 className="text-lg font-serif font-bold italic text-white tracking-tight leading-tight">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-slate-300 text-[10px] font-mono uppercase tracking-widest mt-1 line-clamp-1 opacity-80">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox / Modal Detail */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-xs p-4"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="bg-white border border-neutral-200 viewfinder-box p-3 rounded-none max-w-4xl w-full relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="viewfinder-corners-bottom"></div>
            <div className="viewfinder-center text-orange-600"></div>

            {/* Image / Video Section */}
            <div className="relative flex-1 bg-neutral-950 min-h-[300px] md:min-h-[450px] flex items-center justify-center overflow-hidden">
              {isVideoItem(activeLightbox) ? (
                <video
                  src={activeLightbox.image}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full max-h-[70vh] object-contain"
                />
              ) : (
                <Image
                  src={activeLightbox.image}
                  alt={activeLightbox.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>

            {/* Info Section */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-neutral-200">
              <div>
                <span className="inline-block px-2.5 py-0.5 border border-neutral-200 text-[8px] font-mono uppercase tracking-widest text-orange-700 font-bold mb-4">
                  {isVideoItem(activeLightbox) ? "📹 VIDEO 30 DETIK" : activeLightbox.category}
                </span>
                <h2 className="text-xl font-serif italic font-bold text-slate-900 leading-tight mb-3">
                  {activeLightbox.title}
                </h2>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  {activeLightbox.description || "Tidak ada deskripsi yang tersedia untuk karya ini."}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Fokus Gallery</span>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="px-4 py-2 border border-neutral-300 font-mono text-[9px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer rounded-none"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Close button at top corner */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 z-30 p-2 bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
