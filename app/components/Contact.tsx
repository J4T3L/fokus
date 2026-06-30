"use client";
import { useState } from "react";
import Reveal from "./Reveal";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="kontak" className="py-24 bg-[#121316] border-t border-neutral-900 relative">
      {/* Decorative blurred background shape */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-orange-950/5 blur-3xl pointer-events-none translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Reveal direction="up">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-white font-serif leading-tight">
              Punya <span className="italic font-bold text-orange-500">Pertanyaan?</span>
            </h2>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-3">Hubungi tim kami untuk konsultasi gratis atau permintaan penawaran khusus.</p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={200}>
          <div className="bg-[#1A1C21] border border-neutral-800 viewfinder-box p-3 rounded-none relative">
            <div className="viewfinder-corners-bottom"></div>
            <div className="viewfinder-center text-orange-500"></div>

            <div className="grid lg:grid-cols-5 border border-neutral-800 bg-[#1A1C21]">
              
              {/* Contact Info (Side) */}
              <div className="bg-[#121316] p-10 lg:col-span-2 text-white flex flex-col relative overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10"></span>
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10"></span>
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10"></span>
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10"></span>
                
                <h3 className="text-xl font-serif italic font-bold mb-10 relative z-10 text-orange-500">Informasi Kontak</h3>
                
                <div className="space-y-10 flex-1 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-neutral-800 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-1">Telepon / WhatsApp</h4>
                      <a
                        href="https://wa.me/6281222200110"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-orange-500 transition-colors text-xs font-mono tracking-wider leading-relaxed block"
                      >
                        +62 812-2220-0110<br/>Respon cepat jam kerja
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-neutral-800 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-1">Email</h4>
                      <p className="text-slate-400 text-xs font-mono tracking-wider leading-relaxed">hello@fokus.id</p>
                    </div>
                  </div>
 
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-neutral-800 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mb-1">Lokasi Studio</h4>
                      <a
                        href="https://maps.app.goo.gl/TofT9r3NMaHJUSFa9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-orange-500 transition-colors text-xs font-mono tracking-wider leading-relaxed block"
                      >
                        Karangan Putih, Kec. Kelua,<br/>Kabupaten Tabalong,<br/>Kalimantan Selatan 71552
                      </a>
                    </div>
                  </div>
                </div>
 
                {/* Socials */}
                <div className="flex gap-4 mt-12 pt-8 border-t border-neutral-800 relative z-10">
                   <a href="https://instagram.com/fokus-studio-" target="_blank" rel="noopener noreferrer" className="w-8 h-8 border border-neutral-800 flex items-center justify-center text-xs font-mono text-slate-400 hover:border-white hover:text-white transition-colors" title="Instagram">IG</a>
                   <a href="#" className="w-8 h-8 border border-neutral-800 flex items-center justify-center text-xs font-mono text-slate-400 hover:border-white hover:text-white transition-colors" title="Facebook">FB</a>
                   <a href="#" className="w-8 h-8 border border-neutral-800 flex items-center justify-center text-xs font-mono text-slate-400 hover:border-white hover:text-white transition-colors" title="Tiktok">TK</a>
                </div>
              </div>
 
              {/* Form */}
              <div className="p-10 lg:col-span-3 bg-[#1A1C21]">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 border border-green-500 flex items-center justify-center mb-6 bg-transparent relative">
                      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-green-500"></span>
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-green-500"></span>
                      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-green-500"></span>
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-green-500"></span>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M20 6 9 17l-5-5"></path></svg>
                    </div>
                    <h3 className="text-xl font-serif italic font-bold text-white mb-2">Pesan Berhasil Dikirim!</h3>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-8 max-w-xs">Tim representatif kami akan segera menghubungi Anda kembali melalui kontak yang diberikan.</p>
                    <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 border border-neutral-800 font-mono text-xs uppercase tracking-widest text-slate-300 hover:bg-neutral-800 transition-colors cursor-pointer rounded-none">Kirim Pesan Lagi</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2">Nama Lengkap</label>
                        <input type="text" required className="w-full px-3 py-2 border border-neutral-800 bg-neutral-900 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-orange-500 rounded-none transition-colors" placeholder="Masukkan nama" />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2">Nomor Telepon</label>
                        <input type="tel" className="w-full px-3 py-2 border border-neutral-800 bg-neutral-900 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-orange-500 rounded-none transition-colors" placeholder="08xx..." />
                      </div>
                    </div>
 
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2">Email</label>
                      <input type="email" required className="w-full px-3 py-2 border border-neutral-800 bg-neutral-900 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-orange-500 rounded-none transition-colors" placeholder="nama@email.com" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2">Kategori Pertanyaan</label>
                      <div className="relative">
                        <select required className="w-full px-3 py-2.5 border border-neutral-800 bg-neutral-900 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-orange-500 rounded-none transition-colors appearance-none cursor-pointer">
                          <option value="" disabled selected className="bg-neutral-900 text-slate-400">Pilih subjek...</option>
                          <option value="equipment" className="bg-neutral-900 text-white">Penyewaan Alat</option>
                          <option value="studio" className="bg-neutral-900 text-white">Penyewaan Studio</option>
                          <option value="service" className="bg-neutral-900 text-white">Jasa Fotografi</option>
                          <option value="other" className="bg-neutral-900 text-white">Lainnya</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                           <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
 
                    <div className="flex-1">
                      <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-2">Pesan</label>
                      <textarea rows={4} required className="w-full px-3 py-2 border border-neutral-800 bg-neutral-900 text-slate-100 font-mono text-xs focus:outline-hidden focus:border-orange-500 rounded-none transition-colors h-32 resize-none" placeholder="Ceritakan detail kebutuhan atau pertanyaan Anda..." />
                    </div>
 
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xs font-mono uppercase tracking-widest disabled:opacity-50">
                        {loading ? "Mengirim Pesan..." : "Kirim Pesan Sekarang"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
 
            </div>
          </div>
        </Reveal>
 
      </div>
    </section>
  );
}
