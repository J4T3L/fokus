"use client";

import { useState } from "react";

interface CancelModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: CancelModalProps) {
  const [reason, setReason] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !orderId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!reason.trim()) {
      setErrorMsg("Mohon isi alasan pembatalan pesanan.");
      return;
    }
    if (!bankInfo.trim()) {
      setErrorMsg("Mohon isi nomor rekening & nama bank/e-wallet untuk pengembalian dana (refund).");
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMsg("Mohon isi nomor WhatsApp aktif untuk konfirmasi refund.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}/cancel-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
          bankInfo: bankInfo.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pengajuan pembatalan berhasil dikirim.");
        setReason("");
        setBankInfo("");
        setWhatsapp("");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Gagal mengajukan pembatalan.");
      }
    } catch (err) {
      console.error("Cancellation submit error:", err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700">
            <span className="text-xl">⚠️</span>
            <h3 className="font-bold text-slate-900 text-base">
              Form Pengajuan Pembatalan &amp; Refund
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            ID Pesanan: <strong className="font-mono text-slate-900">{orderId}</strong>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              Pengajuan Anda akan ditinjau oleh Admin. Setelah disetujui (ACC), status pesanan akan menjadi <strong>Dibatalkan</strong>, stok barang dikembalikan, dan dana diproses ke nomor rekening Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alasan Pembatalan *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Ada acara keluarga mendadak, perubahan lokasi kegiatan, dll..."
              className="input-modern text-xs py-2 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor Rekening &amp; Nama Bank / E-Wallet (Untuk Refund) *
            </label>
            <input
              type="text"
              required
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              placeholder="Contoh: BCA 1234567890 a.n Ahmad Dahlan"
              className="input-modern text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nomor WhatsApp / HP Aktif *
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="input-modern text-xs py-2 font-mono"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Pengajuan Pembatalan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
