"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RentalItem {
  id: string;
  quantity: number;
  duration: number;
  price: number;
  subtotal: number;
  equipment: {
    id: string;
    name: string;
    brand: string;
    type: string;
    image?: string;
    stock: number;
    available: number;
  } | null;
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

interface RentalRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "PROCESSING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  notes?: string;
  borrower: Borrower;
  items: RentalItem[];
  paymentStatus: string;
  paymentMethod: string;
  isOverdue: boolean;
  diffDays: number;
}

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RentalMonitoringPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "superuser";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rentals");
      if (res.ok) {
        const data = await res.json();
        setRentals(data || []);
      }
    } catch (err) {
      console.error("Failed to load rental monitoring data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchRentals();
    }
  }, [user, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Dibatasi</h2>
        <p className="text-slate-500 text-sm mb-4">Halaman monitoring sewa barang hanya dapat diakses oleh Admin.</p>
        <Link href="/dashboard" className="btn-primary inline-block px-4 py-2 text-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = async (rentalId: string, newStatus: string) => {
    try {
      setUpdatingId(rentalId);
      const res = await fetch(`/api/orders/${rentalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchRentals();
        if (selectedRental && selectedRental.id === rentalId) {
          setSelectedRental(null);
        }
      }
    } catch (e) {
      console.error("Error updating rental status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics calculation
  const totalRentals = rentals.length;
  const activeRentals = rentals.filter((r) => r.status === "ACTIVE").length;
  const processingRentals = rentals.filter((r) => r.status === "PROCESSING" || r.status === "PENDING").length;
  const overdueRentals = rentals.filter((r) => r.isOverdue).length;
  const completedRentals = rentals.filter((r) => r.status === "COMPLETED").length;

  // Filter rentals for UI display
  const filteredRentals = rentals.filter((r) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "OVERDUE"
        ? r.isOverdue
        : r.status === activeTab;

    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      r.orderNumber.toLowerCase().includes(query) ||
      r.borrower.name.toLowerCase().includes(query) ||
      r.borrower.email.toLowerCase().includes(query) ||
      r.borrower.phone.toLowerCase().includes(query) ||
      r.items.some((i) => i.equipment?.name.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Monitoring Sewa Equipment
          </h1>
          <p className="text-slate-500 text-sm">
            Pantau barang sewa yang sedang dipinjam, identitas peminjam, tenggat waktu pengembalian, dan ketersediaan stok.
          </p>
        </div>
        <button
          onClick={fetchRentals}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Rentals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Sedang Dipinjam</span>
            <span className="text-3xl font-extrabold text-blue-600">{activeRentals}</span>
            <span className="text-xs text-slate-400 block mt-1">Barang aktif di lapangan</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            📷
          </div>
        </div>

        {/* Processing / Ready */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Menunggu Pickup</span>
            <span className="text-3xl font-extrabold text-amber-600">{processingRentals}</span>
            <span className="text-xs text-slate-400 block mt-1">Lunas / Siap diserahkan</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ⏳
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Terlambat Kembali</span>
            <span className="text-3xl font-extrabold text-rose-600">{overdueRentals}</span>
            <span className="text-xs text-slate-400 block mt-1">Lewat batas tenggat</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            🚨
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Sudah Dikembalikan</span>
            <span className="text-3xl font-extrabold text-emerald-600">{completedRentals}</span>
            <span className="text-xs text-slate-400 block mt-1">Stok telah kembali</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✅
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="modern-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100/70 p-1 rounded-xl">
          {[
            { id: "ALL", label: `Semua (${totalRentals})` },
            { id: "PROCESSING", label: `Menunggu (${processingRentals})` },
            { id: "ACTIVE", label: `Dipinjam (${activeRentals})` },
            { id: "OVERDUE", label: `Terlambat (${overdueRentals})` },
            { id: "COMPLETED", label: `Selesai (${completedRentals})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Cari nama peminjam, telepon, barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern pl-9 py-2 text-xs"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Rentals Monitoring Table */}
      <div className="modern-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data peminjam...</div>
        ) : filteredRentals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg">
              🔍
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak ada data peminjaman</h3>
            <p className="text-slate-400 text-xs">Tidak ditemukan transaksi sewa barang dengan kriteria pencarian ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3.5">No. Order & Peminjam</th>
                  <th className="px-5 py-3.5">Barang yang Disewa</th>
                  <th className="px-5 py-3.5">Periode Sewa</th>
                  <th className="px-5 py-3.5">Status Peminjaman</th>
                  <th className="px-5 py-3.5 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredRentals.map((record) => {
                  const isUpdating = updatingId === record.id;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Borrower & Order ID */}
                      <td className="px-5 py-4 align-top">
                        <span className="font-mono font-bold text-slate-900 block mb-1">
                          {record.orderNumber}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">{record.borrower.name}</p>
                          <p className="text-slate-500 font-mono text-[11px]">📞 {record.borrower.phone}</p>
                          <p className="text-slate-400 text-[11px] truncate max-w-[180px]">✉️ {record.borrower.email}</p>
                          {record.borrower.address && record.borrower.address !== "—" && (
                            <p className="text-slate-500 text-[11px] line-clamp-1 italic max-w-[200px]" title={record.borrower.address}>
                              🏠 {record.borrower.address}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Equipment Rented */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-2">
                          {record.items.map((it) => (
                            <div key={it.id} className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              {it.equipment?.image ? (
                                <img
                                  src={it.equipment.image}
                                  alt={it.equipment.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-400 font-bold">
                                  📷
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-800 text-xs">
                                  {it.equipment?.name || "Item Equipment"}
                                </p>
                                <p className="text-slate-500 text-[11px]">
                                  {it.equipment?.brand} • <span className="font-semibold text-orange-600">{it.quantity} Unit</span> ({it.duration} hari)
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1">
                          <p className="text-slate-600 font-medium">
                            <span className="text-slate-400 font-normal">Mulai:</span> {formatDate(record.startDate)}
                          </p>
                          <p className="text-slate-600 font-medium">
                            <span className="text-slate-400 font-normal">Kembali:</span> {formatDate(record.endDate)}
                          </p>
                          {record.isOverdue && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                              🚨 TERLAMBAT {Math.abs(record.diffDays)} HARI
                            </span>
                          )}
                          {!record.isOverdue && record.status === "ACTIVE" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                              ⏱️ Sisa {record.diffDays} Hari
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              record.status === "ACTIVE"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : record.status === "PROCESSING" || record.status === "PENDING"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : record.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {record.status === "ACTIVE"
                              ? "Sedang Dipinjam"
                              : record.status === "PROCESSING"
                              ? "Menunggu Pickup"
                              : record.status === "PENDING"
                              ? "Menunggu Bayar"
                              : record.status === "COMPLETED"
                              ? "Sudah Dikembalikan"
                              : "Dibatalkan"}
                          </span>
                          <p className="text-slate-400 text-[10px] font-mono block">
                            Total: {formatIDR(record.totalAmount)}
                          </p>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-5 py-4 align-top text-right space-y-1.5">
                        {record.status === "PROCESSING" && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(record.id, "ACTIVE")}
                            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? "Memproses..." : "📦 Serahkan Barang (Aktifkan)"}
                          </button>
                        )}

                        {record.status === "ACTIVE" && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(record.id, "COMPLETED")}
                            className="w-full sm:w-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isUpdating ? "Memproses..." : "✅ Terima Pengembalian"}
                          </button>
                        )}

                        {(record.status === "PROCESSING" || record.status === "PENDING") && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(record.id, "CANCELLED")}
                            className="block w-full sm:w-auto ml-auto px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Batalkan Sewa
                          </button>
                        )}

                        {record.status === "COMPLETED" && (
                          <span className="text-slate-400 text-[11px] font-semibold italic">
                            Transaksi Selesai
                          </span>
                        )}

                        <button
                          onClick={() => setSelectedRental(record)}
                          className="block text-slate-500 hover:text-slate-800 text-[10px] underline font-medium ml-auto mt-1 cursor-pointer"
                        >
                          Detail Peminjam
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base">Detail Peminjam & Sewa</h3>
              <button
                onClick={() => setSelectedRental(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-bold mb-1">No. Transaksi</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{selectedRental.orderNumber}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block mb-1">Informasi Peminjam</span>
                <p className="font-bold text-slate-900 text-sm">{selectedRental.borrower.name}</p>
                <p className="text-slate-600">📞 Telepon: {selectedRental.borrower.phone}</p>
                <p className="text-slate-600">✉️ Email: {selectedRental.borrower.email}</p>
                <p className="text-slate-600">🏠 Alamat: {selectedRental.borrower.address || "—"}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block mb-2">Item Disewa</span>
                <div className="space-y-2">
                  {selectedRental.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900">{it.equipment?.name}</p>
                        <p className="text-slate-500 text-[11px]">{it.equipment?.brand} • {it.quantity} Unit x {it.duration} Hari</p>
                      </div>
                      <p className="font-bold text-slate-800">{formatIDR(it.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900 text-sm">
                <span>Total Biaya</span>
                <span>{formatIDR(selectedRental.totalAmount)}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedRental(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
