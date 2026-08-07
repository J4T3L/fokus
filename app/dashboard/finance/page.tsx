"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FinancePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<"ALL" | "INCOME" | "REFUND">("ALL");
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superuser";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user && user.role === "user") router.push("/dashboard");
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance");
      const data = await res.json();
      setFinanceData(data);
    } catch (err) {
      console.error("Error loading finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  const summary = financeData?.summary || {
    totalIncome: 0,
    totalRefunds: 0,
    netRevenue: 0,
    refundCount: 0,
    incomeCount: 0,
  };

  const transactions: any[] = financeData?.transactions || [];

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filterCategory === "ALL" ? true : t.category === filterCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      t.trxId.toLowerCase().includes(query) ||
      t.user.toLowerCase().includes(query) ||
      (t.bankInfo && t.bankInfo.toLowerCase().includes(query)) ||
      (t.reason && t.reason.toLowerCase().includes(query));

    return matchesType && matchesSearch;
  });

  const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const formatWaLink = (phoneStr?: string) => {
    if (!phoneStr || phoneStr === "—") return "#";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Monitoring Keuangan &amp; Refund Pembatalan
          </h1>
          <p className="text-slate-500 text-sm">
            Pantau arus kas pendapatan masuk, pengeluaran dana refund akibat pembatalan pesanan, dan pendapatan bersih.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-19.13 0C1.768 7.441 1 8.375 1 9.456v6.294A2.25 2.25 0 003.25 18h1.091" />
            </svg>
            Cetak Ringkasan Keuangan
          </button>
          <button
            onClick={loadData}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Uang Masuk
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">
              {formatIDR(summary.totalIncome)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Dari {summary.incomeCount} transaksi lunas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            💵
          </div>
        </div>

        {/* Total Refunds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Refund Pembatalan
            </span>
            <span className="text-2xl font-extrabold text-rose-600">
              {formatIDR(summary.totalRefunds)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Dari {summary.refundCount} pembatalan di-ACC
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
            💸
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pendapatan Bersih
            </span>
            <span className="text-2xl font-extrabold text-blue-600">
              {formatIDR(summary.netRevenue)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Total Uang Masuk dikurangi Refund
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            📈
          </div>
        </div>

        {/* Refund Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Transaksi Dibatalkan
            </span>
            <span className="text-2xl font-extrabold text-amber-600">
              {summary.refundCount} pesanan
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Sudah diproses refund
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
        </div>
      </div>

      {/* Control Bar: Category Tabs & Search */}
      <div className="modern-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setFilterCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilterCategory("INCOME")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === "INCOME"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💵 Uang Masuk ({summary.incomeCount})
          </button>
          <button
            onClick={() => setFilterCategory("REFUND")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === "REFUND"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💸 Uang Keluar (Refund) ({summary.refundCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Cari pelanggan, ID pesanan, rekening..."
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

      {/* Financial Ledger Table */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Waktu &amp; ID Transaksi
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Pelanggan &amp; Layanan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Detail Rekening / Metode
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Alasan / Catatan Kas
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">
                  Nominal &amp; Status Arus Kas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Memuat buku kas keuangan...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada log transaksi keuangan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, i) => {
                  const isRefund = t.category === "REFUND";

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-900 text-xs mb-0.5">{t.date}</div>
                        <div className="text-[11px] font-mono text-slate-500">{t.trxId}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-slate-900">{t.user}</p>
                        <p className="text-xs text-slate-400 font-medium">{t.type}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {isRefund ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 block w-fit">
                              🏦 {t.bankInfo}
                            </span>
                            {t.whatsapp && t.whatsapp !== "—" && (
                              <a
                                href={formatWaLink(t.whatsapp)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-emerald-600 hover:underline font-bold inline-flex items-center gap-1"
                              >
                                📱 WA: {t.whatsapp}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 font-mono">
                            💳 {t.method}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-slate-600">
                        <span className="italic">"{t.reason}"</span>
                      </td>
                      <td className="px-6 py-4 align-top text-right space-y-1">
                        <div
                          className={`text-sm font-extrabold ${
                            isRefund ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {isRefund ? `- ${formatIDR(t.amount)}` : `+ ${formatIDR(t.amount)}`}
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isRefund
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {isRefund ? "💸 REFUND KELUAR" : "💵 PENDAPATAN MASUK"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center font-mono">
          Data Buku Kas Keuangan Terhubung Dengan Database Transaksi Server.
        </div>
      </div>
    </div>
  );
}
