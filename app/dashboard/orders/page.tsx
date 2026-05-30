"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InvoiceModal from "@/app/components/InvoiceModal";
import PaymentSimulator from "@/app/components/PaymentSimulator";
import ReviewModal from "@/app/components/ReviewModal";

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

  const isAdmin = user?.role === "admin" || user?.role === "superuser";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      const url = isAdmin ? "/api/orders" : `/api/orders?userId=${user?.id || ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
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
      // Optimistic update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="animate-fade-up">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {isAdmin ? "Rekap Seluruh Pesanan" : "Riwayat Pesanan Saya"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin ? "Pantau dan perbarui status pesanan pelanggan secara manual." : "Daftar layanan yang pernah Anda pesan."}
          </p>
        </div>
        {!isAdmin && (
          <Link href="/dashboard/booking" className="btn-primary px-4 py-2 text-sm shadow-sm">Buat Pesanan Baru</Link>
        )}
      </div>

      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">ID Pesanan</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Pelanggan</th>}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Layanan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Biaya / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">Sedang menyinkronkan data pesanan...</td></tr>
              ) : orders.length === 0 ? (
                 <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400">Tidak ada pesanan ditemukan.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{o.id}</td>
                  {isAdmin && <td className="px-6 py-4 text-sm font-bold text-slate-900">{o.user}</td>}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{o.itemStr}</div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">{o.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      o.status.includes("Selesai") ? "bg-slate-100 text-slate-600 border-slate-200" :
                      o.status.includes("Menunggu") ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {!isAdmin && o.status === "Menunggu Pembayaran" ? (
                        <button
                          onClick={() => handleSimulatePayment(o.id, o.rawAmount || 0)}
                          className="btn-primary py-1.5 px-3 text-xs shadow-sm shadow-blue-500/20 w-[120px] cursor-pointer"
                        >
                          Pay Now
                        </button>
                      ) : isAdmin ? (
                        <select
                          value={o.status}
                          onChange={(e) => handleAdminUpdateStatus(o.id, e.target.value)}
                          className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-md focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 cursor-pointer shadow-sm outline-none"
                        >
                          <option value="Menunggu Pembayaran">Menunggu</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Aktif">Aktif</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm font-bold text-slate-900">{o.amount}</div>
                          {o.status === "Selesai" && (
                            <button
                              onClick={() => setIsReviewOpen(true)}
                              className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 mt-1 cursor-pointer"
                            >
                              ★ Beri Ulasan
                            </button>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedInvoiceId(o.id);
                          setIsInvoiceOpen(true);
                        }}
                        className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-orange-700 transition-colors cursor-pointer mt-1"
                      >
                        Lihat Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

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
    </>
  );
}
