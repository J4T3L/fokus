"use client";
import { useState, useEffect } from "react";
import Reveal from "./Reveal";

const staticTestimonials = [
  {
    name: "Anisa Rahmawati",
    role: "Klien Wedding",
    text: "Momen pernikahan kami didokumentasikan dengan sangat indah. Detail yang ditangkap fotografer sangat berkesan dan tim bekerja sangat profesional.",
    rating: 5,
    avatar: "A"
  },
  {
    name: "Budi Santoso",
    role: "Content Creator",
    text: "Sewa kamera yang sangat bisa diandalkan. Kondisi alat selalu prima, baterai penuh, dan proses pengambilannya cepat tanpa ribet.",
    rating: 5,
    avatar: "B"
  },
  {
    name: "Dewi Lestari",
    role: "Brand Owner",
    text: "Studio ini dilengkapi peralatan profesional. Nyaman digunakan, staf ramah, dan hasilnya sesuai ekspektasi kampanye kami.",
    rating: 4,
    avatar: "D"
  },
];

export default function Testimonials() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((t: any) => ({
            name: t.user.name,
            role: t.user.role === "client" ? "Pelanggan Fokus" : t.user.role === "admin" ? "Tim Fokus" : t.user.role,
            text: t.text,
            rating: t.rating,
            avatar: t.user.name.slice(0, 1).toUpperCase()
          }));
          setList(mapped);
        } else {
          setList(staticTestimonials);
        }
      })
      .catch(() => {
        setList(staticTestimonials);
      });
  }, []);
  return (
    <section id="testimoni" className="py-24 bg-[#FAF9F5] border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Reveal direction="up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-orange-700 font-mono tracking-widest uppercase text-xs mb-3">ULASAN PELANGGAN</h2>
            <h3 className="text-3xl md:text-4xl font-light text-slate-900 font-serif leading-tight">
              Apa Kata Mereka Tentang <span className="italic font-bold text-orange-700">Kami</span>
            </h3>
            <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">Kepercayaan Anda adalah prioritas utama kami. Ini adalah pengalaman nyata dari klien kami.</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {list.map((t, i) => (
            <Reveal key={i} delay={i * 150} direction="up" className="h-full">
              <div className="bg-white border border-neutral-200 viewfinder-box p-8 flex flex-col h-full rounded-none relative">
                <div className="viewfinder-corners-bottom"></div>
                <div className="viewfinder-center text-orange-600"></div>
                
                <div className="flex gap-1 mb-6 text-orange-700">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill={j < t.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-slate-700 leading-relaxed mb-8 flex-1 italic font-serif text-base">"{t.text}"</p>
                
                <div className="flex items-center gap-4 pt-6 border-t border-neutral-100 mt-auto">
                  <div className="w-12 h-12 border border-neutral-300 flex items-center justify-center text-slate-800 font-bold font-serif italic text-lg bg-neutral-50 shadow-inner">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm font-serif italic">{t.name}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-orange-700">{t.role}</div>
                  </div>
                </div>
                
              </div>
            </Reveal>
          ))}
        </div>
        
      </div>
    </section>
  );
}
