"use client";

interface EulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export default function EulaModal({ isOpen, onClose, onAccept }: EulaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto flex items-center justify-center p-4 font-sans print:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-[#FAF9F5] border border-neutral-300 w-full max-w-2xl relative shadow-2xl rounded-none overflow-hidden animate-fade-up z-10 flex flex-col max-h-[85vh]">
        
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-700"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-700"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-700"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-700"></div>

        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
              SYARAT &amp; KONTRAK RENTAL FOKUS STUDIO
            </span>
            <h2 className="text-base font-serif italic font-bold text-white">
              User Agreement, EULA &amp; Syarat Penggunaan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Terms & Conditions Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-700 space-y-4 leading-relaxed bg-white flex-1 border-b border-neutral-200">
          <div className="p-3 bg-orange-50 border border-orange-200 text-orange-950 rounded text-[11px] font-bold">
            ⚠️ PERHATIAN: Harap membaca seluruh pasal Kontrak Sewa di bawah ini sebelum menyetujui dan melanjutkan proses pembayaran.
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pasal 1: Hak dan Kewajiban Penyewa (User Agreement &amp; EULA)
            </h3>
            <p className="text-[11px] text-slate-600">
              1.1 Penyewa bertanggung jawab penuh atas keselamatan, integritas fisik, dan kelengkapan unit alat fotografi/videografi atau studio foto yang disewa selama masa sewa berlangsung.
            </p>
            <p className="text-[11px] text-slate-600">
              1.2 Penyewa dilarang memindahtangankan, menyewakan kembali (sub-letting), atau menjaminkan barang yang disewa kepada pihak ketiga tanpa persetujuan tertulis dari manajemen Fokus Studio.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pasal 2: Ketentuan Pengembalian &amp; Denda Keterlambatan (Overdue)
            </h3>
            <p className="text-[11px] text-slate-600">
              2.1 Alat sewa WAJIB dikembalikan tepat pada jam dan tanggal deadline pengembalian yang disepakati (*Due Date*).
            </p>
            <p className="text-[11px] text-slate-600">
              2.2 Keterlambatan pengembalian melewati batas jam berturut-turut akan dikenakan denda keterlambatan (*Late Fee*) yang dihitung per jam atau denda tarif harian penuh secara otomatis.
            </p>
            <p className="text-[11px] text-slate-600">
              2.3 Apabila ingin memperpanjang durasi sewa, penyewa WAJIB melakukan pengajuan *Extend Rental* di dashboard sebelum batas jam sewa berakhir.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pasal 3: Kerusakan, Kehilangan, dan Ganti Rugi
            </h3>
            <p className="text-[11px] text-slate-600">
              3.1 Kerusakan alat yang disebabkan oleh kelalaian (jatuh, terkena air, benturan, terbakar) WAJIB diganti sebesar biaya estimasi servis &amp; penggantian sparepart resmi.
            </p>
            <p className="text-[11px] text-slate-600">
              3.2 Dalam hal **Barang Hilang / Rusak Total (Total Loss)**, penyewa WAJIB mengganti denda kehilangan sebesar 100% dari harga pembelian baru barang terkait.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pasal 4: Kebijakan Privasi &amp; Data Pribadi
            </h3>
            <p className="text-[11px] text-slate-600">
              Data KTP/SIM/Identitas penyewa disimpan aman sesuai Kebijakan Privasi Fokus Studio dan hanya digunakan untuk verifikasi hukum jaminan sewa.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-slate-600 font-mono text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-5 py-2.5 bg-orange-700 hover:bg-orange-850 text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
            >
              ✓ Saya Memahami &amp; Menyetujui Kontrak
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
