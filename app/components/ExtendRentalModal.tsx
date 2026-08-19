"use client";

import { useState } from "react";

interface ExtendRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

export default function ExtendRentalModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: ExtendRentalModalProps) {
  const [extraDays, setExtraDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  // Calculate estimated extra cost
  const dailyRate = order.items?.reduce((sum: number, item: any) => {
    const p = item.equipment?.pricePerDay || item.price || 0;
    return sum + p * (item.quantity || 1);
  }, 0) || 0;

  const estimatedCost = dailyRate * extraDays;

  const handleExtend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.dbId || order.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraDays }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Berhasil memperpanjang sewa!");
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Gagal memperpanjang durasi sewa.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs" onClick={onClose} />

      <div className="bg-[#FAF9F5] border border-neutral-300 w-full max-w-md relative shadow-2xl overflow-hidden animate-fade-up z-10">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
              PERPANJANG SEWA (EXTEND RENTAL)
            </span>
            <h2 className="text-sm font-serif italic font-bold text-white">
              {order.id}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-xs text-slate-800 bg-white">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Item Dihitung Per Hari:</div>
            <div className="font-bold text-slate-900">
              {order.items?.map((i: any) => i.name || i.equipment?.name).join(", ")}
            </div>
            <div className="text-[10px] text-slate-500">
              Tarif Gabungan: <strong className="text-slate-900">Rp {dailyRate.toLocaleString("id-ID")}/hari</strong>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1.5">
              Pilih Tambahan Durasi (Hari):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setExtraDays(d)}
                  className={`py-2 border text-xs font-bold transition-all cursor-pointer ${
                    extraDays === d
                      ? "bg-orange-700 text-white border-orange-700 shadow-xs"
                      : "bg-white border-neutral-300 text-slate-700 hover:bg-neutral-50"
                  }`}
                >
                  +{d} Hari
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 uppercase">Estimasi Biaya Tambahan:</span>
            <span className="text-orange-700 font-serif italic text-base">
              Rp {estimatedCost.toLocaleString("id-ID")}
            </span>
          </div>

          {error && (
            <p className="text-[10px] text-rose-600 font-mono font-bold bg-rose-50 p-2 border border-rose-200">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 flex justify-between items-center border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-slate-600 font-mono text-xs uppercase"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleExtend}
            className="px-5 py-2.5 bg-orange-700 hover:bg-orange-850 text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Konfirmasi Extend & Tagih"}
          </button>
        </div>
      </div>
    </div>
  );
}
