"use client";

import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Link from "next/link";

const CATEGORIES = ["Semua", "Kamera", "Lensa", "Lighting", "Aksesori"];

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PublicCatalogPage() {
  const { equipment, cart, addToCart, removeFromCart, updateCartQty } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const activeItems = equipment.filter((e) => e.isActive);

  // Filter items
  const filteredItems = activeItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (eq: any) => {
    addToCart(eq);
    window.dispatchEvent(new Event("open_cart"));
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
                RENTAL KAMERA &amp; AKSESORIS
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 font-serif leading-tight">
                Katalog Alat Premium <span className="italic font-bold text-orange-700">Siap Pakai</span>
              </h1>
              <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
                Sewa kamera DSLR/Mirrorless, lensa GM/L-Series, lighting studio, dan gimbal stabilizer untuk mendukung kelancaran proyek visual Anda.
              </p>
            </Reveal>
          </div>

          {/* Filters & Search Box */}
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
                    {cat}
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
                  placeholder="CARI KAMERA, LENSA, STABILIZER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-3 py-2.5 border border-neutral-300 bg-white font-mono text-[10px] tracking-wider focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                />
              </div>
            </div>
          </Reveal>

          {/* Catalog Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-200">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest font-mono mb-1">Peralatan tidak ditemukan</h3>
              <p className="text-slate-400 text-xs">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, i) => {
                const inCart = cart.find((entry) => entry.equipment.id === item.id);
                return (
                  <Reveal key={item.id} delay={i * 60} direction="up" className="h-full">
                    <div className="bg-white border border-neutral-200 viewfinder-box p-3 rounded-none flex flex-col h-full relative group hover:border-neutral-400 cursor-default">
                      <div className="viewfinder-corners-bottom"></div>
                      <div className="viewfinder-center text-orange-600"></div>

                      {/* Image Header */}
                      <div className="h-48 w-full bg-slate-100 relative overflow-hidden shrink-0 border-b border-neutral-200">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                        )}

                        {/* Stock Badge */}
                        <span
                          className={`absolute top-3 left-3 inline-flex items-center px-2 py-0.5 border text-[8px] font-mono font-bold uppercase tracking-widest shadow-xs ${
                            item.available > 0 
                              ? "bg-white/90 border-green-300 text-green-700" 
                              : "bg-white/90 border-slate-300 text-slate-600"
                          }`}
                        >
                          {item.available > 0 ? `QTY: ${item.available}` : "Habis"}
                        </span>

                        {/* Tag Badge */}
                        {item.tag && (
                          <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 border border-orange-300 bg-white/90 text-[8px] font-mono font-bold text-orange-700 uppercase tracking-widest shadow-xs">
                            {item.tag}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="pt-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">
                              {item.brand} &bull; {item.category}
                            </div>
                            <div className="flex items-center gap-1 text-amber-600 font-mono text-[10px] font-bold">
                              <span>⭐</span>
                              <span>4.9</span>
                              <span className="text-slate-400 font-normal text-[9px]">(18)</span>
                            </div>
                          </div>
                          <h3 className="text-base font-serif italic font-bold text-slate-900 line-clamp-1 mb-2" title={item.name}>
                            {item.name}
                          </h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4" title={item.description}>
                            {item.description}
                          </p>

                          {/* Specs list if available */}
                          {item.specs && (
                            <div className="border-t border-neutral-100 pt-3 mt-3 mb-4">
                              <div className="text-[8px] text-slate-400 font-mono uppercase tracking-widest mb-1">Spesifikasi</div>
                              <p className="text-[10px] text-slate-500 leading-tight font-mono uppercase tracking-wider line-clamp-2">
                                {item.specs}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Pricing and Action Button */}
                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-auto">
                          <div>
                            <div className="text-[8px] text-slate-400 font-mono uppercase tracking-widest mb-0.5">Tarif Sewa</div>
                            <div className="text-xs font-mono font-extrabold text-orange-700">
                              {formatIDR(item.pricePerDay)}
                              <span className="text-[9px] font-semibold text-slate-400">/hari</span>
                            </div>
                          </div>

                          {inCart ? (
                            <div className="flex items-center gap-1 bg-white border border-neutral-300 px-1 py-0.5">
                              <button
                                onClick={() => {
                                  if (inCart.quantity === 1) removeFromCart(item.id);
                                  else updateCartQty(item.id, inCart.quantity - 1);
                                }}
                                className="w-5 h-5 flex items-center justify-center font-mono text-xs text-slate-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-mono font-bold text-slate-850 w-4 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => updateCartQty(item.id, inCart.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center font-mono text-xs text-slate-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={item.available <= 0}
                              className={`px-3 py-1.5 border font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer rounded-none ${
                                item.available <= 0
                                  ? "bg-slate-100 border-neutral-200 text-slate-400 cursor-not-allowed"
                                  : "bg-white border-neutral-900 text-neutral-900 hover:bg-orange-700 hover:border-orange-700 hover:text-white"
                              }`}
                            >
                              {item.available <= 0 ? "Habis" : "+ Sewa"}
                            </button>
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
      <Footer />
    </>
  );
}
