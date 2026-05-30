export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#121316] pt-20 pb-10 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          <div className="lg:col-span-2">
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

          <div>
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono">Layanan</h4>
            <ul className="space-y-4">
              {["Sewa Kamera & Lensa", "Sewa Studio Foto", "Jasa Fotografi", "Paket Wedding", "Komersial"].map((l) => (
                <li key={l}>
                  <a href="#layanan" className="text-xs text-slate-400 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono">Perusahaan</h4>
            <ul className="space-y-4">
              {["Tentang Kami", "Portfolio Karya", "Testimoni Klien", "Karir"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest font-mono">Bantuan</h4>
            <ul className="space-y-4">
              {["Hubungi Kami", "Syarat & Ketentuan", "Kebijakan Privasi", "FAQ"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
            © {year} Fokus Studio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/fokus-studio-" target="_blank" rel="noopener noreferrer" className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
