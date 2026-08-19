"use client";

import { useState } from "react";

interface PayFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
}

export default function PayFeeModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: PayFeeModalProps) {
  const [method, setMethod] = useState<"TRANSFER" | "CASH">("TRANSFER");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const lateFee = order.lateFee || 0;
  const extensionFee = order.extensionFee || 0;
  const damageFee = order.damageFee || 0;
  const lossFee = order.lossFee || 0;
  const totalFee = lateFee + extensionFee + damageFee + lossFee;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProofImage(data.url);
      } else {
        setError("Gagal mengunggah foto bukti bayar.");
      }
    } catch {
      setError("Kesalahan koneksi saat unggah.");
    } finally {
      setUploading(false);
    }
  };

  const handlePay = async () => {
    if (method === "TRANSFER" && !proofImage) {
      setError("⚠️ Wajib mengunggah bukti transfer terlebih dahulu!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.dbId || order.id}/pay-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          proofImage: proofImage || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pembayaran denda berhasil dikonfirmasi!");
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Gagal memproses pembayaran.");
      }
    } catch {
      setError("Kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs" onClick={onClose} />

      <div className="bg-[#FAF9F5] border border-neutral-300 w-full max-w-lg relative shadow-2xl overflow-hidden animate-fade-up z-10">
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 border-b border-rose-800 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-rose-300 font-bold block">
              BAYAR DENDA / BIAYA TAMBAHAN
            </span>
            <h2 className="text-sm font-serif italic font-bold text-white">
              Order {order.id}
            </h2>
          </div>
          <button onClick={onClose} className="text-rose-300 hover:text-white font-mono text-sm cursor-pointer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-xs text-slate-800 bg-white">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded space-y-1 text-[11px]">
            <div className="font-bold text-rose-950 uppercase border-b border-rose-200 pb-1">
              Rincian Tagihan Denda / Biaya:
            </div>
            {lateFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>• Denda Keterlambatan (Overdue):</span>
                <span className="font-bold text-rose-700">Rp {lateFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            {extensionFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>• Biaya Perpanjang Sewa (Extend):</span>
                <span className="font-bold text-slate-900">Rp {extensionFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            {damageFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>• Denda Kerusakan Barang:</span>
                <span className="font-bold text-rose-700">Rp {damageFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            {lossFee > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>• Denda Kehilangan Barang (100% Ganti Rugi):</span>
                <span className="font-bold text-rose-800">Rp {lossFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            {order.damageNotes && (
              <div className="pt-1.5 border-t border-rose-200 text-[10px] text-rose-900 italic">
                Catatan Kondisi Admin: "{order.damageNotes}"
              </div>
            )}
            <div className="pt-2 border-t border-rose-200 flex justify-between text-xs font-extrabold text-slate-900">
              <span>TOTAL TAGIHAN:</span>
              <span className="text-rose-700 text-sm">Rp {totalFee.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-700 block mb-1.5">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("TRANSFER")}
                className={`p-2.5 border text-xs font-bold font-mono transition-all cursor-pointer ${
                  method === "TRANSFER"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-neutral-300 text-slate-700 hover:bg-neutral-50"
                }`}
              >
                💳 Transfer Bank
              </button>
              <button
                type="button"
                onClick={() => setMethod("CASH")}
                className={`p-2.5 border text-xs font-bold font-mono transition-all cursor-pointer ${
                  method === "CASH"
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white border-neutral-300 text-slate-700 hover:bg-neutral-50"
                }`}
              >
                💵 Bayar Tunai (Cash Kasir)
              </button>
            </div>
          </div>

          {/* Proof Image Section if Transfer */}
          {method === "TRANSFER" && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-700 block mb-1.5">
                Unggah Resi Bukti Transfer (WAJIB):
              </span>
              {proofImage ? (
                <div className="p-2 border border-emerald-300 bg-emerald-50 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={proofImage} alt="Bukti" className="w-10 h-10 object-cover rounded border" />
                    <span className="text-[10px] font-bold text-emerald-800">✓ Resi Terunggah</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProofImage(null)}
                    className="text-[10px] text-rose-600 font-bold hover:underline"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    id="fee-proof-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="fee-proof-upload"
                    className="w-full border-2 border-dashed border-neutral-300 hover:border-orange-600 p-2.5 block text-center rounded text-[10px] font-mono font-bold text-slate-600 cursor-pointer bg-neutral-50"
                  >
                    {uploading ? "Mengunggah..." : "PILIH FOTO RESI STRUK TRANSFER"}
                  </label>
                </div>
              )}
            </div>
          )}

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
            onClick={handlePay}
            className="px-5 py-2.5 bg-rose-700 hover:bg-rose-850 text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Konfirmasi Pembayaran Denda"}
          </button>
        </div>
      </div>
    </div>
  );
}
