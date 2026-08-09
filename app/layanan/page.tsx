"use client";

import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Link from "next/link";

const CATEGORIES = ["Semua", "Wedding", "Prewedding", "Product", "Fashion", "Portrait", "Event"];

const fallbackServices = [
  {
    id: "fs1",
    name: "Wedding Premium Package",
    category: "Wedding",
    description: "Dokumentasi hari bahagia Anda secara lengkap dengan kualitas cinematik dan album fisik eksklusif.",
    priceStart: 7500000,
    duration: "Full Day (8-10 Jam)",
    includes: ["2 Photographer", "1 Videographer", "Album Cetak Eksklusif 30x30", "Semua Soft Copy File & 50 Edit", "Video Cinematic 3 Menit"],
    isActive: true,
  },
  {
    id: "fs2",
    name: "Prewedding Studio Session",
    category: "Prewedding",
    description: "Sesi foto prewedding intim di dalam studio A dengan konsep tematik dan lighting profesional.",
    priceStart: 2500000,
    duration: "4 Jam Sesi",
    includes: ["1 Photographer", "Makeup Artist (MUA) Standby", "2 Backdrop Pilihan", "20 Edit Foto & Soft Copy", "Cetak Kanvas 40x60 + Bingkai"],
    isActive: true,
  },
  {
    id: "fs3",
    name: "Commercial Product Catalog",
    category: "Product",
    description: "Foto katalog produk kreatif beresolusi tinggi dengan penataan flatlay maupun model.",
    priceStart: 1500000,
    duration: "3 Jam Sesi",
    includes: ["1 Photographer & Stylist", "Kamera Resolusi Tinggi (45MP+)", "Background Studio Putih / Kertas Warna", "15 Edit Foto Produk", "Siap Pakai untuk E-Commerce"],
    isActive: true,
  },
];

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PublicServicesPage() {
  const { services } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const activeServices = services.length > 0 ? services.filter(s => s.isActive) : fallbackServices;

  // Filter items
  const filteredServices = activeServices.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Reveal direction="up">
              <span className="text-orange-700 font-mono tracking-widest uppercase text-xs mb-3 block">
                JASA FOTOGRAFI &amp; PAKET
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 font-serif leading-tight">
                Paket Layanan Visual <span className="italic font-bold text-orange-700">Profesional</span>
              </h1>
              <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
                Temukan paket dokumentasi terbaik yang dirancang khusus untuk kebutuhan pernikahan, prewedding, produk, katalog komersial, maupun portret individu Anda.
              </p>
            </Reveal>
          </div>

          {/* Filters */}
          <Reveal direction="up" delay={150}>
            <div className="flex flex-wrap gap-2 mb-12 bg-white p-6 border border-neutral-200 viewfinder-box rounded-none relative justify-center">
              <div className="viewfinder-corners-bottom"></div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 border text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                    selectedCategory === cat
                      ? "bg-orange-700 border-orange-700 text-white"
                      : "bg-white border-neutral-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest font-mono mb-1">Paket tidak ditemukan</h3>
              <p className="text-slate-400 text-xs">Coba cari kategori paket yang berbeda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((svc, i) => (
                <Reveal key={svc.id} delay={i * 100} direction="up" className="h-full">
                  <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none flex flex-col h-full justify-between relative">
                    <div className="viewfinder-corners-bottom"></div>
                    <div className="viewfinder-center text-orange-600"></div>

                    <div>
                      {/* Badge / Category */}
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 border border-neutral-200 text-[9px] font-mono uppercase tracking-widest text-slate-700">
                          {svc.category}
                        </span>
                        {svc.duration && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {svc.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-serif italic font-bold text-slate-900">{svc.name}</h3>
                        <div className="flex items-center gap-1 text-amber-600 font-mono text-xs font-bold shrink-0">
                          <span>⭐ 4.9</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs mb-6 leading-relaxed">{svc.description}</p>

                      {/* Inclusions / Deliverables */}
                      {svc.includes && svc.includes.length > 0 && (
                        <div className="mb-8 bg-slate-50 p-4 border border-neutral-200">
                          <div className="text-[9px] font-bold text-slate-800 font-mono uppercase tracking-widest mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-orange-700 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Termasuk Dalam Paket
                          </div>
                          <ul className="space-y-3">
                            {svc.includes.map((inc, index) => (
                              <li key={index} className="flex items-start text-xs text-slate-600 font-medium">
                                <svg className="w-4 h-4 text-orange-600 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Price and Book button */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Mulai Dari</div>
                        <div className="text-lg font-extrabold text-orange-700">{formatIDR(svc.priceStart)}</div>
                      </div>
                      <Link
                        href="/dashboard/booking"
                        className="btn-primary py-2.5 px-5 text-xs font-mono uppercase tracking-widest"
                      >
                        Pesan Paket
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
