import Image from "next/image";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section className="bg-slate-50 relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left Text */}
          <div className="lg:w-1/2">
            <Reveal direction="up" delay={0}>
              <div className="inline-flex items-center px-4 py-2 bg-white border border-neutral-200 shadow-xs text-neutral-800 text-xs font-mono uppercase tracking-widest mb-8">
                <span className="flex w-1.5 h-1.5 rounded-full bg-orange-600 mr-2.5 animate-pulse"></span>
                Studio Fotografi &amp; Rental Alat
              </div>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light text-slate-900 tracking-tight mb-8 leading-[1.08] font-serif">
                Tangkap <span className="italic font-bold text-orange-700">momen</span>, <br />
                lestarikan <span className="italic font-bold">kenangan.</span>
              </h1>
            </Reveal>

            <Reveal direction="up" delay={200}>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                Jasa fotografi profesional, penyewaan studio berstandar industri, dan peralatan kamera terlengkap untuk karya visual luar biasa.
              </p>
            </Reveal>

            <Reveal direction="up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a href="/layanan" className="btn-primary space-x-2 text-sm py-3 px-6">
                  <span>Mulai Sekarang</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
                <a href="/galeri" className="btn-secondary text-sm py-3 px-6">
                  Lihat Karya
                </a>
              </div>
            </Reveal>

            <Reveal direction="up" delay={400}>
              <div className="flex items-center gap-8 border-t border-slate-200 pt-8">
                <div>
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">Klien Terpuaskan</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50+</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">Peralatan Premium</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">Studio A</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-1">Studio Unggulan</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 relative w-full h-[400px] sm:h-[500px] lg:h-[600px]">
            <Reveal direction="left" delay={200} className="w-full h-full">
              <div className="absolute inset-0 bg-orange-100/50 transform rotate-1 scale-98 transition-transform duration-700 opacity-60"></div>

              <div className="w-full h-full relative bg-white p-3 border border-neutral-200 viewfinder-box">
                <div className="viewfinder-corners-bottom"></div>
                <div className="viewfinder-center text-orange-600"></div>

                {/* Viewfinder metadata overlay */}
                <div className="absolute top-6 left-6 z-20 flex gap-4 text-[9px] font-mono tracking-widest text-white bg-black/45 backdrop-blur-xs px-2.5 py-1">
                  <span>RAW</span>
                  <span>ISO 100</span>
                  <span>F/2.8</span>
                </div>
                <div className="absolute top-6 right-6 z-20 text-[9px] font-mono tracking-widest text-red-500 bg-black/45 backdrop-blur-xs px-2.5 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  <span>REC</span>
                </div>
                <div className="absolute bottom-6 left-6 z-20 text-[9px] font-mono tracking-widest text-white bg-black/45 backdrop-blur-xs px-2.5 py-1">
                  <span>1/250s</span>
                </div>
                <div className="absolute bottom-6 right-6 z-20 text-[9px] font-mono tracking-widest text-white bg-black/45 backdrop-blur-xs px-2.5 py-1">
                  <span>AWB</span>
                </div>

                <div className="w-full h-full relative overflow-hidden bg-slate-100">
                  <Image
                    src="/hero.png"
                    alt="Fotografer Fokus Studio"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-103"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
