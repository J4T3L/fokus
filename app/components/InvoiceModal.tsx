"use client";
import { useEffect, useState } from "react";

interface InvoiceUser {
  name: string;
  email: string;
  phone?: string;
}

interface InvoiceItem {
  id: string;
  quantity: number;
  duration: number;
  price: number;
  subtotal: number;
  name: string;
  brand?: string;
  type: string;
}

interface InvoiceData {
  type: string;
  id: string;
  dbId: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  notes?: string;
  startDate?: string;
  endDate?: string;
  user: InvoiceUser;
  items: InvoiceItem[];
}

interface InvoiceModalProps {
  id: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InvoiceModal({ id, isOpen, onClose }: InvoiceModalProps) {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data detail invoice.");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "PENDING") {
      return (
        <span className="px-3 py-1 border border-yellow-300 bg-yellow-50 text-yellow-750 text-[10px] font-mono font-bold uppercase tracking-widest">
          Menunggu Pembayaran
        </span>
      );
    }
    if (s === "PROCESSING" || s === "CONFIRMED") {
      return (
        <span className="px-3 py-1 border border-blue-300 bg-blue-50 text-blue-750 text-[10px] font-mono font-bold uppercase tracking-widest">
          Lunas (Diproses)
        </span>
      );
    }
    if (s === "ACTIVE" || s === "IN_USE") {
      return (
        <span className="px-3 py-1 border border-green-300 bg-green-50 text-green-700 text-[10px] font-mono font-bold uppercase tracking-widest">
          Lunas (Aktif)
        </span>
      );
    }
    if (s === "COMPLETED") {
      return (
        <span className="px-3 py-1 border border-slate-350 bg-slate-50 text-slate-700 text-[10px] font-mono font-bold uppercase tracking-widest">
          Lunas (Selesai)
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="px-3 py-1 border border-red-300 bg-red-50 text-red-700 text-[10px] font-mono font-bold uppercase tracking-widest">
          Dibatalkan
        </span>
      );
    }
    return (
      <span className="px-3 py-1 border border-neutral-300 bg-neutral-50 text-neutral-600 text-[10px] font-mono font-bold uppercase tracking-widest">
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:static print:bg-white print:p-0">
      {/* Background click to close */}
      <div className="fixed inset-0 -z-10 print:hidden" onClick={onClose} />

      <div className="bg-white border border-neutral-250 p-6 sm:p-10 w-full max-w-3xl shadow-2xl relative rounded-none flex flex-col my-4 sm:my-8 print:border-0 print:shadow-none print:p-0 print:w-full print:max-w-none print:min-h-0">
        
        {/* Viewfinder Corners (decorations) - Hidden on Print */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neutral-400 print:hidden"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neutral-400 print:hidden"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neutral-400 print:hidden"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neutral-400 print:hidden"></div>

        {/* Modal Controls - Hidden on Print */}
        <div className="flex justify-between items-center mb-8 border-b border-neutral-100 pb-4 print:hidden">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">Nota Transaksi / Invoice</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !!error || !data}
              className="px-4 py-2 bg-neutral-900 border border-neutral-900 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-orange-700 hover:border-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cetak Invoice
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-slate-700 font-mono text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs font-mono uppercase tracking-widest text-slate-400">
            Mengambil data invoice...
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-900 text-neutral-900 font-mono text-[10px] uppercase tracking-widest hover:bg-neutral-50 cursor-pointer"
            >
              Kembali
            </button>
          </div>
        ) : data ? (
          <div className="flex-1 print:block">
            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 pb-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 border border-neutral-950 flex items-center justify-center text-neutral-950 font-bold relative font-serif italic text-sm">
                    <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-neutral-950"></span>
                    <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-neutral-950"></span>
                    <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-neutral-950"></span>
                    <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-neutral-950"></span>
                    F
                  </div>
                  <span className="font-bold text-lg text-slate-900 tracking-widest font-mono uppercase">Fokus</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">
                  Sewa Kamera, Studio &amp; Jasa Fotografi<br />
                  Karangan Putih, Kec. Kelua, Kabupaten Tabalong, Kalimantan Selatan 71552<br />
                  hello@fokus.id | +62 812-2220-0110
                </p>
              </div>
              <div className="sm:text-right">
                <h1 className="text-xl sm:text-2xl font-light font-serif text-slate-900 leading-none mb-1 uppercase tracking-wide">
                  Invoice
                </h1>
                <p className="text-xs font-mono font-bold text-slate-700 tracking-wider mb-2">
                  #{data.id}
                </p>
                <div className="mt-4">
                  {getStatusBadge(data.status)}
                </div>
              </div>
            </div>

            {/* Bill To & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                  DITAGIHKAN KEPADA:
                </h3>
                <div className="font-serif italic font-bold text-slate-900 text-sm mb-1">
                  {data.user.name}
                </div>
                <p className="text-[10px] font-mono text-slate-500 leading-normal uppercase tracking-wider">
                  Email: {data.user.email}<br />
                  Telepon: {data.user.phone || "-"}
                </p>
              </div>
              <div className="sm:text-right">
                <h3 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                  INFORMASI TRANSAKSI:
                </h3>
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase tracking-wider">
                  Tanggal Invoice: <span className="font-bold text-slate-800">{formatDate(data.createdAt)}</span><br />
                  Metode: Transfer Bank / Virtual Account<br />
                  Tipe Layanan: <span className="font-bold text-slate-800">{data.type === "booking" ? "Booking Studio" : "Sewa Equipment / Jasa"}</span>
                  {data.startDate && (
                    <>
                      <br />
                      Mulai: <span className="font-bold text-slate-800">{formatDate(data.startDate)}</span>
                    </>
                  )}
                  {data.endDate && data.startDate !== data.endDate && (
                    <>
                      <br />
                      Selesai: <span className="font-bold text-slate-800">{formatDate(data.endDate)}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-neutral-200 overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Deskripsi Layanan / Barang</th>
                    <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">Kuantitas</th>
                    <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">Durasi</th>
                    <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-right">Harga Satuan</th>
                    <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {data.items.map((item) => (
                    <tr key={item.id} className="bg-white text-[11px] font-mono">
                      <td className="px-4 py-3 text-slate-900 font-serif italic font-bold">
                        {item.name}
                        {item.brand && <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{item.brand}</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700">{item.quantity}x</td>
                      <td className="px-4 py-3 text-center text-slate-700">
                        {item.duration} {item.type === "studio" ? "jam" : item.type === "service" ? "sesi" : "hari"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatIDR(item.price)}</td>
                      <td className="px-4 py-3 text-right text-slate-900 font-bold">{formatIDR(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-neutral-100 pt-6">
              <div className="max-w-md">
                {data.notes && (
                  <>
                    <h4 className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">CATATAN PESANAN:</h4>
                    <p className="text-[10px] font-mono text-slate-500 italic leading-relaxed">{data.notes}</p>
                  </>
                )}
              </div>
              <div className="w-full sm:w-64 shrink-0 sm:text-right font-mono">
                <div className="flex justify-between sm:justify-end gap-10 py-1.5 text-xs text-slate-500">
                  <span>Subtotal:</span>
                  <span className="text-slate-800">{formatIDR(data.totalAmount)}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-10 py-1.5 text-xs text-slate-500">
                  <span>Pajak (0%):</span>
                  <span className="text-slate-800">Rp 0</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-10 py-3 border-t border-neutral-200 text-sm font-bold text-orange-700 mt-2">
                  <span>Total Tagihan:</span>
                  <span>{formatIDR(data.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions / Thank you */}
            <div className="border-t border-neutral-250 pt-8 mt-12 text-center">
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                Pembayaran via transfer ke Bank BCA Rek: 123-456-7890 a/n PT Fokus Studio Visual.<br />
                Kirim bukti transfer melalui WhatsApp Widget di pojok kanan bawah halaman.<br />
                <span className="text-slate-800 font-bold mt-2 block font-serif italic lowercase first-letter:uppercase">Terima kasih atas kepercayaan Anda menggunakan Fokus Studio &amp; Rental.</span>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
