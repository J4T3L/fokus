"use client";

import { useAppData } from "../context/AppDataContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reveal from "../components/Reveal";
import Link from "next/link";
import Image from "next/image";

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PublicStudioPage() {
  const { studios } = useAppData();
  const activeStudios = studios.filter((s) => s.isActive);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Reveal direction="up">
              <span className="text-orange-700 font-mono tracking-widest uppercase text-xs mb-3 block">
                SEWA STUDIO
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 font-serif leading-tight">
                Ruang Kreatif <span className="italic font-bold text-orange-700">Premium</span> untuk Sesi Foto Anda
              </h1>
              <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
                Studio foto lengkap ber-AC dengan penataan cahaya alami maupun studio professional lighting yang siap memaksimalkan hasil foto Anda.
              </p>
            </Reveal>
          </div>

          {/* Studios list container */}
          {activeStudios.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Belum ada studio yang terdaftar atau aktif.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {activeStudios.map((studio, i) => (
                <Reveal key={studio.id} delay={i * 100} direction="up">
                  <div className="bg-white border border-neutral-200 viewfinder-box p-3 rounded-none flex flex-col lg:flex-row relative">
                    <div className="viewfinder-corners-bottom"></div>
                    <div className="viewfinder-center text-orange-600"></div>

                    {/* Left: Image */}
                    <div className="relative w-full lg:w-[50%] h-[300px] sm:h-[400px] lg:h-auto bg-slate-100 min-h-[350px]">
                      {studio.image ? (
                        <Image
                          src={studio.image}
                          alt={studio.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" strokeWidth="2" />
                            <path d="M3 9h18" strokeWidth="2" />
                          </svg>
                          <span className="text-xs font-semibold">Tidak ada foto studio</span>
                        </div>
                      )}
                      
                      {/* Viewfinder metadata overlay */}
                      <div className="absolute top-4 left-4 z-20 flex gap-4 text-[9px] font-mono tracking-widest text-white bg-black/45 backdrop-blur-xs px-2.5 py-1">
                        <span>STUDIO</span>
                        <span>F/8.0</span>
                      </div>
                      <div className="absolute top-4 right-4 z-20 text-[9px] font-mono tracking-widest text-red-500 bg-black/45 backdrop-blur-xs px-2.5 py-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                        <span>LIVE</span>
                      </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900 font-serif italic mb-1">
                              {studio.name}
                            </h2>
                            <div className="flex items-center gap-1.5 text-amber-600 font-mono text-xs font-bold">
                              <span>⭐ 5.0</span>
                              <span className="text-slate-400 font-normal text-[10px]">(32 Ulasan Pelanggan)</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center px-3 py-1 border border-neutral-200 text-[10px] font-mono uppercase tracking-widest text-slate-700">
                            Kapasitas: {studio.capacity} Orang
                          </div>
                        </div>

                        <p className="text-slate-500 leading-relaxed text-xs mb-8">
                          {studio.description ||
                            "Studio foto profesional yang fleksibel untuk berbagai sesi pemotretan Anda, mulai dari portrait, produk, keluarga, hingga katalog komersial."}
                        </p>

                        {/* Facilities */}
                        {studio.facilities.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4">
                              Fasilitas Studio &amp; Alat Pendukung
                            </h3>
                            <div className="grid grid-cols-2 gap-3.5">
                              {studio.facilities.map((fac, idx) => (
                                <div key={idx} className="flex items-center text-xs text-slate-600 font-medium">
                                  <svg className="w-4 h-4 text-orange-600 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{fac}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tarif Sewa</div>
                          <div className="text-2xl font-extrabold text-orange-700">
                            {formatIDR(studio.pricePerHour)}
                            <span className="text-xs font-semibold text-slate-500"> / jam</span>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/booking"
                          className="btn-primary py-3 px-6 text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
                          </svg>
                          Pesan Jadwal Sekarang
                        </Link>
                      </div>
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
