"use client";

interface FormDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onAdminAction: (id: string, action: string) => Promise<void>;
  loadingAction?: boolean;
}

export default function FormDetailModal({
  order,
  isOpen,
  onClose,
  onAdminAction,
  loadingAction = false,
}: FormDetailModalProps) {
  if (!isOpen || !order) return null;

  const cancelReq = order.cancelRequest;
  const rescheduleReq = order.rescheduleRequest;

  // Format WhatsApp link
  const formatWaLink = (phoneStr?: string) => {
    if (!phoneStr) return "#";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="font-bold text-sm">
                Detail Form Pengajuan Pelanggan
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                ID Pesanan: {order.id || order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5 mb-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Informasi Pelanggan
              </span>
              <span className="font-mono text-slate-500 font-bold">{order.amount}</span>
            </div>
            <p className="text-slate-900 font-bold text-sm">{order.user}</p>
            <p className="text-slate-500 text-[11px] font-mono">{order.itemStr}</p>
          </div>

          {/* Cancellation Form Details */}
          {cancelReq && (
            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <span className="text-base">🚨</span>
                  <h4 className="font-bold text-xs">Form Pengajuan Pembatalan &amp; Refund</h4>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200/60 text-rose-800">
                  {cancelReq.status || "PENDING_ACC"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Alasan Pembatalan:
                  </span>
                  <p className="text-slate-900 font-medium bg-white p-2.5 rounded-xl border border-rose-100 italic mt-0.5">
                    "{cancelReq.reason}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Informasi Rekening Refund:
                  </span>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-100 font-mono font-bold text-slate-800 text-xs mt-0.5">
                    🏦 {cancelReq.bankInfo}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nomor WhatsApp Pelanggan:
                  </span>
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-rose-100 mt-0.5">
                    <span className="font-mono font-bold text-slate-800 text-xs px-1">
                      📱 {cancelReq.whatsapp}
                    </span>
                    <a
                      href={formatWaLink(cancelReq.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <span>💬 Chat WA</span>
                    </a>
                  </div>
                </div>

                {cancelReq.requestedAt && (
                  <p className="text-[10px] text-slate-400 font-mono pt-1 text-right">
                    Waktu pengajuan: {new Date(cancelReq.requestedAt).toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              {cancelReq.status === "PENDING_ACC" && (
                <div className="pt-3 border-t border-rose-200 flex items-center justify-end gap-2">
                  <button
                    disabled={loadingAction}
                    onClick={() => onAdminAction(order.id, "REJECT_CANCEL")}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ✕ Tolak
                  </button>
                  <button
                    disabled={loadingAction}
                    onClick={() => onAdminAction(order.id, "ACC_CANCEL")}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {loadingAction ? "Memproses..." : "✓ ACC Pembatalan (Kurangi Keuangan)"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reschedule Form Details */}
          {rescheduleReq && (
            <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <span className="text-base">📅</span>
                  <h4 className="font-bold text-xs">Form Pengajuan Reschedule Jadwal</h4>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-200/60 text-blue-800">
                  {rescheduleReq.status || "PENDING_ACC"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Jadwal Baru Yang Diajukan:
                  </span>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100 font-mono font-bold text-blue-900 text-xs mt-0.5">
                    📆 Tanggal: {rescheduleReq.newStartDate || rescheduleReq.newDate}
                    {rescheduleReq.newStartTime && (
                      <span className="block text-slate-600 font-normal mt-0.5">
                        ⏰ Jam: {rescheduleReq.newStartTime} s/d {rescheduleReq.newEndTime}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Alasan Reschedule:
                  </span>
                  <p className="text-slate-900 font-medium bg-white p-2.5 rounded-xl border border-blue-100 italic mt-0.5">
                    "{rescheduleReq.reason}"
                  </p>
                </div>

                {rescheduleReq.requestedAt && (
                  <p className="text-[10px] text-slate-400 font-mono pt-1 text-right">
                    Waktu pengajuan: {new Date(rescheduleReq.requestedAt).toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              {rescheduleReq.status === "PENDING_ACC" && (
                <div className="pt-3 border-t border-blue-200 flex items-center justify-end gap-2">
                  <button
                    disabled={loadingAction}
                    onClick={() => onAdminAction(order.id, "REJECT_RESCHEDULE")}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ✕ Tolak
                  </button>
                  <button
                    disabled={loadingAction}
                    onClick={() => onAdminAction(order.id, "ACC_RESCHEDULE")}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {loadingAction ? "Memproses..." : "✓ ACC Reschedule"}
                  </button>
                </div>
              )}
            </div>
          )}

          {!cancelReq && !rescheduleReq && (
            <div className="text-center py-6 text-slate-400 text-xs">
              Tidak ada form pengajuan khusus pada pesanan ini.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
