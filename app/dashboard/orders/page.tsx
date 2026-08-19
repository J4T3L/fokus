"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceModal from "@/app/components/InvoiceModal";
import PaymentSimulator from "@/app/components/PaymentSimulator";
import ReviewModal from "@/app/components/ReviewModal";
import CancelModal from "@/app/components/CancelModal";
import RescheduleModal from "@/app/components/RescheduleModal";
import FormDetailModal from "@/app/components/FormDetailModal";
import ExtendRentalModal from "@/app/components/ExtendRentalModal";
import PayFeeModal from "@/app/components/PayFeeModal";

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Payment simulator states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorOrderId, setSimulatorOrderId] = useState<string | null>(null);
  const [simulatorAmount, setSimulatorAmount] = useState<number>(0);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Cancel & Reschedule modals
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);
  const [detailModalOrder, setDetailModalOrder] = useState<any | null>(null);

  // Extend Rental & Fee Payment modals
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [extendModalOrder, setExtendModalOrder] = useState<any | null>(null);
  const [isPayFeeOpen, setIsPayFeeOpen] = useState(false);
  const [payFeeModalOrder, setPayFeeModalOrder] = useState<any | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "superuser";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/api/orders" : `/api/orders?userId=${user?.id || ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, isAdmin]);

  if (!user) return null;

  const handleSimulatePayment = (id: string, amount: number) => {
    setSimulatorOrderId(id);
    setSimulatorAmount(amount);
    setIsSimulatorOpen(true);
  };

  const handleAdminUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminAction = async (id: string, actionName: string) => {
    try {
      setUpdatingActionId(id);
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Error processing approval action:", err);
    } finally {
      setUpdatingActionId(null);
    }
  };

  return (
    <>
      <div className="animate-fade-up space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {isAdmin ? "Rekap & Manajemen Pesanan" : "Riwayat Pesanan Saya"}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAdmin
                ? "Pantau pesanan, bukti transfer, dan konfirmasi pengajuan pembatalan/reschedule."
                : "Daftar layanan yang Anda pesan, status pembayaran, dan pengajuan jadwal/batal."}
            </p>
          </div>
          {!isAdmin && (
            <Link href="/dashboard/booking" className="btn-primary px-4 py-2 text-sm shadow-sm">
              Buat Pesanan Baru
            </Link>
          )}
        </div>

        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    ID Pesanan
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Pelanggan
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Layanan &amp; Jadwal
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Status &amp; Pengajuan
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">
                    Biaya / Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                      Sedang menyinkronkan data pesanan...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada pesanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const hasPendingCancel = o.cancelRequest?.status === "PENDING_ACC";
                    const hasPendingReschedule = o.rescheduleRequest?.status === "PENDING_ACC";
                    const isUpdating = updatingActionId === o.id;

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 align-top text-xs font-mono font-bold text-slate-700">
                          {o.id}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 align-top text-sm font-bold text-slate-900">
                            {o.user}
                          </td>
                        )}
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-900 text-sm">{o.itemStr}</div>
                          <div className="text-xs font-medium text-slate-400 mt-0.5">{o.date}</div>
                        </td>
                        <td className="px-6 py-4 align-top space-y-2">
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                o.status.includes("Selesai")
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : o.status.includes("Dibatalkan")
                                  ? "bg-rose-100 text-rose-700 border-rose-200"
                                  : o.status.includes("Menunggu")
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>

                          {/* Cancellation Request Badge / Details */}
                          {hasPendingCancel && (
                            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-xs space-y-1">
                              <span className="font-bold text-rose-700 block">
                                🚨 Pengajuan Pembatalan (Refund)
                              </span>
                              <p className="text-slate-600 text-[11px]">
                                Alasan: <span className="italic">"{o.cancelRequest.reason}"</span>
                              </p>
                              {isAdmin && (
                                <div className="text-[11px] text-slate-700 space-y-0.5 pt-1 border-t border-rose-200/60 font-mono">
                                  <p>🏦 Rekening: {o.cancelRequest.bankInfo}</p>
                                  <p>📱 WA: {o.cancelRequest.whatsapp}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reschedule Request Badge / Details */}
                          {hasPendingReschedule && (
                            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-xs space-y-1">
                              <span className="font-bold text-blue-700 block">
                                📅 Pengajuan Reschedule
                              </span>
                              <p className="text-slate-700 text-[11px] font-mono">
                                Tgl Baru: {o.rescheduleRequest.newStartDate}
                                {o.rescheduleRequest.newStartTime && (
                                  <> ({o.rescheduleRequest.newStartTime} - {o.rescheduleRequest.newEndTime})</>
                                )}
                              </p>
                              <p className="text-slate-600 text-[11px]">
                                Alasan: <span className="italic">"{o.rescheduleRequest.reason}"</span>
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 align-top text-right space-y-2">
                          <div className="text-sm font-bold text-slate-900">{o.amount}</div>

                          {/* ADMIN ACTIONS FOR CANCEL/RESCHEDULE */}
                          {isAdmin && hasPendingCancel && (
                            <div className="flex flex-col gap-1 items-end pt-1">
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdminAction(o.id, "ACC_CANCEL")}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                              >
                                {isUpdating ? "Memproses..." : "✓ ACC Pembatalan (Kurangi Keuangan)"}
                              </button>
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdminAction(o.id, "REJECT_CANCEL")}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                ✕ Tolak Pembatalan
                              </button>
                            </div>
                          )}

                          {isAdmin && hasPendingReschedule && !hasPendingCancel && (
                            <div className="flex flex-col gap-1 items-end pt-1">
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdminAction(o.id, "ACC_RESCHEDULE")}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                              >
                                {isUpdating ? "Memproses..." : "✓ ACC Reschedule"}
                              </button>
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdminAction(o.id, "REJECT_RESCHEDULE")}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                ✕ Tolak Reschedule
                              </button>
                            </div>
                          )}

                          {/* STANDARD ADMIN STATUS DROPDOWN */}
                          {isAdmin && !hasPendingCancel && !hasPendingReschedule && (
                            <select
                              value={o.status}
                              onChange={(e) => handleAdminUpdateStatus(o.id, e.target.value)}
                              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-md focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 cursor-pointer shadow-sm outline-none ml-auto"
                            >
                              <option value="Menunggu Pembayaran">Menunggu</option>
                              <option value="Diproses">Diproses</option>
                              <option value="Aktif">Aktif</option>
                              <option value="Selesai">Selesai</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                          )}

                          {/* USER ACTIONS (PAYMENT, RESCHEDULE, CANCEL) */}
                          {!isAdmin && (
                            <div className="flex flex-col items-end gap-1.5 pt-1">
                              {o.status === "Menunggu Pembayaran" && (
                                <button
                                  onClick={() => handleSimulatePayment(o.id, o.rawAmount || 0)}
                                  className="btn-primary py-1.5 px-3 text-xs shadow-sm shadow-blue-500/20 w-[120px] cursor-pointer"
                                >
                                  Bayar Sekarang
                                </button>
                              )}

                              {o.status !== "Dibatalkan" &&
                                o.status !== "Selesai" &&
                                !hasPendingCancel &&
                                !hasPendingReschedule && (
                                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                                    {/* Extend Rental Button */}
                                    <button
                                      onClick={() => {
                                        setExtendModalOrder(o);
                                        setIsExtendOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                    >
                                      ⏳ Extend Rental
                                    </button>

                                    {/* Pay Fee / Denda Button */}
                                    {((o.lateFee > 0) || (o.damageFee > 0) || (o.lossFee > 0) || (o.extensionFee > 0) || o.feeStatus === "UNPAID") && (
                                      <button
                                        onClick={() => {
                                          setPayFeeModalOrder(o);
                                          setIsPayFeeOpen(true);
                                        }}
                                        className="px-2.5 py-1 bg-rose-700 hover:bg-rose-850 text-white rounded text-[10px] font-mono font-bold transition-colors cursor-pointer shadow-xs"
                                      >
                                        💳 Bayar Denda / Fee
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        setRescheduleOrderId(o.id);
                                        setIsRescheduleOpen(true);
                                      }}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                    >
                                      📅 Reschedule
                                    </button>

                                    <button
                                      onClick={() => {
                                        setCancelOrderId(o.id);
                                        setIsCancelOpen(true);
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                    >
                                      ⚠️ Pembatalan
                                    </button>
                                  </div>
                                )}

                              {o.status === "Selesai" && (
                                <button
                                  onClick={() => setIsReviewOpen(true)}
                                  className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                >
                                  ★ Beri Ulasan
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex flex-col items-end gap-1 mt-1">
                            {isAdmin && (o.cancelRequest || o.rescheduleRequest) && (
                              <button
                                onClick={() => setDetailModalOrder(o)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                🔍 Lihat Detail Form
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedInvoiceId(o.id);
                                setIsInvoiceOpen(true);
                              }}
                              className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-orange-700 transition-colors cursor-pointer"
                            >
                              Lihat Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        id={selectedInvoiceId}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedInvoiceId(null);
        }}
      />

      <PaymentSimulator
        isOpen={isSimulatorOpen}
        onClose={() => {
          setIsSimulatorOpen(false);
          setSimulatorOrderId(null);
          setSimulatorAmount(0);
        }}
        orderId={simulatorOrderId || ""}
        totalAmount={simulatorAmount}
        onSuccess={fetchOrders}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        userId={user.id}
      />

      <CancelModal
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setCancelOrderId(null);
        }}
        orderId={cancelOrderId}
        onSuccess={fetchOrders}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleOrderId(null);
        }}
        orderId={rescheduleOrderId}
        onSuccess={fetchOrders}
      />

      <FormDetailModal
        order={detailModalOrder}
        isOpen={!!detailModalOrder}
        onClose={() => setDetailModalOrder(null)}
        onAdminAction={async (id, action) => {
          await handleAdminAction(id, action);
          setDetailModalOrder(null);
        }}
        loadingAction={!!updatingActionId}
      />

      <ExtendRentalModal
        isOpen={isExtendOpen}
        onClose={() => {
          setIsExtendOpen(false);
          setExtendModalOrder(null);
        }}
        order={extendModalOrder}
        onSuccess={fetchOrders}
      />

      <PayFeeModal
        isOpen={isPayFeeOpen}
        onClose={() => {
          setIsPayFeeOpen(false);
          setPayFeeModalOrder(null);
        }}
        order={payFeeModalOrder}
        onSuccess={fetchOrders}
      />
    </>
  );
}
