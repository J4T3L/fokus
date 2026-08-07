"use client";

import { useState } from "react";

interface RescheduleModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !orderId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!startDate) {
      setErrorMsg("Mohon pilih tanggal jadwal baru Anda.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStartDate: startDate,
          newEndDate: endDate || startDate,
          newStartTime: startTime,
          newEndTime: endTime,
          reason: reason.trim() || "Perubahan jadwal kegiatan pelanggan",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pengajuan reschedule berhasil dikirim.");
        setStartDate("");
        setEndDate("");
        setReason("");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Gagal mengajukan reschedule.");
      }
    } catch (err) {
      console.error("Reschedule submit error:", err);
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-xl">📅</span>
            <h3 className="font-bold text-slate-900 text-base">
              Form Pengajuan Reschedule Jadwal
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
              Tentukan tanggal &amp; jam jadwal baru yang Anda inginkan. Pengajuan ini akan ditinjau oleh Admin untuk disesuaikan dengan ketersediaan studio/alat.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Baru *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="input-modern text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="input-modern text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Mulai (Khusus Studio)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-modern text-xs py-2 block bg-white border border-[#e7e6df]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Selesai (Khusus Studio)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-modern text-xs py-2 block bg-white border border-[#e7e6df]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alasan Perubahan Jadwal (Opsional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Jadwal acara bergeser ke hari Sabtu, permohonan waktu penjemputan baru..."
              className="input-modern text-xs py-2 resize-none"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Pengajuan Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
