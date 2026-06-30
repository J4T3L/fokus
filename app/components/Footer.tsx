"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0B0C0E] text-slate-300 pt-24 pb-12 border-t border-neutral-900 relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-orange-950/10 blur-3xl pointer-events-none -translate-x-1/2"></div>
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-neutral-900/20 blur-3xl pointer-events-none translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section: CTA & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-neutral-900">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-orange-700 font-mono tracking-[0.2em] uppercase text-[10px] font-bold mb-3 block">
              Mari Berkolaborasi
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white font-serif leading-tight max-w-xl">
              Tangkap <span className="italic font-bold text-orange-600">kreativitas</span> Anda berikutnya bersama kami.
            </h3>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#121316] border border-neutral-800 p-6 md:p-8 relative viewfinder-box rounded-none">
              {/* Custom Viewfinder Corners inside Newsletter Card */}
              <div className="viewfinder-corners-bottom"></div>
              <div className="viewfinder-center text-orange-600"></div>

              <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-2">Ikuti Buletin Kami</h4>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider mb-6">Dapatkan tips fotografi, update promo, &amp; info studio terhangat.</p>

              {subscribed ? (
                <div className="flex items-center gap-3 bg-neutral-900/60 border border-green-950/40 p-4 animate-fade-up">
                  <div className="w-6 h-6 rounded-full border border-green-500 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-white font-bold">Terima Kasih!</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">Email Anda telah berhasil didaftarkan.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="EMAIL@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-orange-700 font-mono text-xs text-white placeholder-slate-600 px-4 py-3 outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-700 hover:bg-orange-600 text-white font-mono text-xs uppercase tracking-widest px-6 py-3 transition-all duration-300 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{loading ? "MEMPROSES..." : "DAFTAR"}</span>
                    {!loading && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Navigation & Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 border border-white flex items-center justify-center text-white font-bold relative font-serif italic text-sm">
                  <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white"></span>
                  <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white"></span>
                  <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white"></span>
                  <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white"></span>
                  F
                </div>
                <span className="font-bold text-lg text-white tracking-widest font-mono uppercase">Fokus</span>
              </div>
              <p className="text-slate-400 text-xs font-mono uppercase tracking-wider leading-relaxed mb-6 max-w-sm">
                Platform layanan fotografi terpadu. Kami menyediakan persewaan alat premium, studio profesional, dan jasa dokumentasi untuk segala kebutuhan visual Anda.
              </p>
            </div>
            
            {/* Telemetry info just for aesthetic */}
            <div className="hidden lg:block">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                KALSEL • INDONESIA
              </p>
              <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest">
                LOC: 2.2154° S, 115.2657° E
              </p>
            </div>
          </div>

          {/* Links 1 */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-px after:bg-orange-700">Layanan</h4>
            <ul className="space-y-4">
              {[
                { label: "Sewa Kamera & Lensa", href: "/katalog" },
                { label: "Sewa Studio Foto", href: "/studio" },
                { label: "Jasa Fotografi", href: "/layanan" },
                { label: "Paket Wedding", href: "/layanan" },
                { label: "Komersial", href: "/layanan" }
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all duration-300">
                    <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0 font-mono text-[9px] font-bold">/</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-px after:bg-orange-700">Perusahaan</h4>
            <ul className="space-y-4">
              {[
                { label: "Tentang Kami", href: "/#kontak" },
                { label: "Portfolio Karya", href: "/galeri" },
                { label: "Testimoni Klien", href: "/#testimonials" },
                { label: "Karir", href: "#" }
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all duration-300">
                    <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0 font-mono text-[9px] font-bold">/</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 3 */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-px after:bg-orange-700">Bantuan</h4>
            <ul className="space-y-4">
              {[
                { label: "Hubungi Kami", href: "/#kontak" },
                { label: "Syarat & Ketentuan", href: "#" },
                { label: "Kebijakan Privasi", href: "#" },
                { label: "FAQ / Pertanyaan", href: "#" }
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all duration-300">
                    <span className="text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0 font-mono text-[9px] font-bold">/</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening hours & contact info */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-px after:bg-orange-700">Jam Operasional</h4>
            <p className="text-xs font-mono text-slate-400 leading-relaxed mb-4">
              SENIN — MINGGU<br />
              08:00 — 22:00 WITA
            </p>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              *TUTUP PADA HARI LIBUR NASIONAL
            </p>
          </div>

        </div>

        {/* Big Wordmark Watermark */}
        <div className="w-full overflow-hidden select-none border-t border-neutral-900/60 pt-4">
          <h2 className="text-[12vw] font-black text-[#15161A]/40 text-center tracking-[0.2em] leading-none uppercase font-sans select-none pointer-events-none translate-y-2">
            Fokus
          </h2>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest order-2 sm:order-1">
            © {year} Fokus Studio. All rights reserved.
          </p>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            <div className="flex gap-2">
              <a
                href="https://instagram.com/fokus-studio-"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-neutral-800 hover:border-white hover:text-white flex items-center justify-center text-[10px] font-mono text-slate-400 transition-colors"
                title="Instagram"
              >
                IG
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-neutral-800 hover:border-white hover:text-white flex items-center justify-center text-[10px] font-mono text-slate-400 transition-colors"
                title="Facebook"
              >
                FB
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-neutral-800 hover:border-white hover:text-white flex items-center justify-center text-[10px] font-mono text-slate-400 transition-colors"
                title="Twitter"
              >
                TW
              </a>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="w-8 h-8 border border-neutral-800 hover:border-orange-700 hover:text-orange-700 flex items-center justify-center text-slate-400 transition-all cursor-pointer group"
              title="Kembali ke atas"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
