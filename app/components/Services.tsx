"use client";
import Image from "next/image";
import Reveal from "./Reveal";
import { useAppData } from "../context/AppDataContext";
import Link from "next/link";

const fallbackServices = [
  {
    title: "Sewa Peralatan",
    desc: "Koleksi kamera, lensa, dan lighting dari brand terkemuka (Sony, Canon, Nikon, Godox) dengan kondisi terawat dan selalu siap pakai.",
    image: "/camera-rental.png",
    features: ["Harga kompetitif harian/mingguan", "Pemeriksaan alat ketat", "Layanan antar jemput alat"],
    price: "Mulai Rp 150.000 / hari",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    )
  },
  {
    title: "Sewa Studio",
    desc: "Studio foto premium ber-AC dengan beragam jenis backdrop, pencahayaan alami, ruang ganti khusus, dan peralatan lighting lengkap.",
    image: "/studio-rental.png",
    features: ["Pilihan 3 ukuran studio", "Backdrop aneka warna", "Free WiFi & ruang tunggu"],
    price: "Mulai Rp 200.000 / jam",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h18"/>
      </svg>
    )
  },
];

export default function Services() {
  const { services } = useAppData();
  
  // Ambil 3 layanan teratas dari database (jika ada), jika database masih kosong gunakan fallback
  const displayServices = services.length > 0 
    ? services.slice(0, 3).map(svc => ({
        title: svc.name,
        desc: svc.description,
        image: "/photo-service.png", 
        features: svc.includes || ["Konsultasi konsep", "File HD", "Editing dasar"],
        price: "Mulai Rp " + svc.priceStart.toLocaleString("id-ID"),
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
          </svg>
        )
      }))
    : fallbackServices;

  return (
    <section id="layanan" className="py-24 bg-[#121316] border-t border-neutral-900 relative">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-orange-950/5 blur-3xl pointer-events-none -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Reveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-orange-500 font-mono tracking-widest uppercase text-xs mb-3 block">LAYANAN KAMI</span>
            <h2 className="text-3xl md:text-5xl font-light text-white font-serif leading-tight">
              Solusi Visual <span className="italic font-bold text-orange-500">Terpadu</span>
            </h2>
            <p className="text-slate-400 text-sm mt-4 max-w-md mx-auto">
              Kami menyediakan ekosistem terpadu untuk memastikan setiap proyek kreatif Anda berjalan lancar dengan hasil maksimal.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {displayServices.map((svc, i) => (
            <Reveal key={svc.title} delay={i * 200} direction="up" className="h-full">
              <div className="bg-[#1A1C21] border border-neutral-800 viewfinder-box p-3 rounded-none flex flex-col h-full overflow-hidden group">
                <div className="viewfinder-corners-bottom"></div>
                <div className="viewfinder-center text-orange-500"></div>

                <div className="relative h-64 bg-neutral-900 overflow-hidden">
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#121316]/95 backdrop-blur-md rounded-none border border-neutral-800 flex items-center justify-center text-orange-500 transform group-hover:-rotate-6 transition-transform">
                    {svc.icon}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="text-xl font-bold text-white font-serif italic mb-3">{svc.title}</h4>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed flex-1">
                    {svc.desc}
                  </p>
                  
                  <div className="mb-6 bg-[#121316]/60 p-4 border border-neutral-800/80">
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-3 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      Inklusi Paket
                    </div>
                    <ul className="space-y-2">
                      {svc.features.map((f, index) => (
                        <li key={index} className="flex items-start text-xs text-slate-400 font-medium">
                          <svg className="w-4 h-4 text-orange-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between mt-auto">
                    <div>
                       <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Mulai Dari</div>
                       <div className="text-sm font-extrabold text-orange-500">{svc.price}</div>
                    </div>
                    <Link href="/dashboard/booking" className="w-8 h-8 rounded-none bg-neutral-800 hover:bg-orange-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-16 text-center">
            <Link href="/layanan" className="inline-block px-8 py-3.5 border border-white hover:bg-white text-white hover:text-[#121316] font-mono uppercase text-xs tracking-widest transition-all duration-300 rounded-none cursor-pointer">
              Lihat Semua Layanan &amp; Paket Foto
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
