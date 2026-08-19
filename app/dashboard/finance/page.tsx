"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FinancePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MAIN_RENTAL" | "PENALTY_DAMAGE">("MAIN_RENTAL");
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
    totalRentalIncome: 0,
    totalPenaltyIncome: 0,
    grandTotalIncome: 0,
    totalRefunds: 0,
    netRevenue: 0,
    refundCount: 0,
    rentalCount: 0,
    penaltyCount: 0,
  };

  const transactions: any[] = financeData?.transactions || [];
  const penaltyTransactions: any[] = financeData?.penaltyTransactions || [];

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterCategory === "ALL" ? true : t.category === filterCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      t.trxId.toLowerCase().includes(query) ||
      t.user.toLowerCase().includes(query) ||
      (t.bankInfo && t.bankInfo.toLowerCase().includes(query)) ||
      (t.reason && t.reason.toLowerCase().includes(query));

    return matchesType && matchesSearch;
  });

  const filteredPenalties = penaltyTransactions.filter((p) => {
    const query = search.toLowerCase();
    return (
      !query ||
      p.trxId.toLowerCase().includes(query) ||
      p.user.toLowerCase().includes(query) ||
      p.item.toLowerCase().includes(query) ||
      (p.damageNotes && p.damageNotes.toLowerCase().includes(query))
    );
  });

  const formatIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

  const formatWaLink = (phoneStr?: string) => {
    if (!phoneStr || phoneStr === "—") return "#";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    return `https://wa.me/${cleaned}`;
  };

  const handleExportCSV = () => {
    const headers = [
      "ID Transaksi",
      "Waktu",
      "Kategori Kas",
      "Tipe Layanan",
      "Pelanggan",
      "Rekening / Catatan",
      "Nominal (Rp)",
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.trxId}"`,
      `"${t.date}"`,
      `"${t.category === "REFUND" ? "REFUND KELUAR" : "SEWA MASUK"}"`,
      `"${t.type}"`,
      `"${t.user}"`,
      `"${t.bankInfo || t.method || "—"}"`,
      t.category === "REFUND" ? -t.amount : t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Keuangan_Fokus_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-up space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-700 block">
            FINANCIAL MONITORING &amp; LEDGER SPLIT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            Laporan Keuangan Fokus Studio
          </h1>
          <p className="text-slate-500 text-sm">
            Pemisahan buku kas antara Pendapatan Persewaan Utama vs Pendapatan Denda, Kerusakan &amp; Kehilangan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-mono"
          >
            <span>📊</span> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer font-mono"
          >
            🖨️ Cetak
          </button>
          <button
            onClick={loadData}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer font-mono"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Rental Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Pendapatan Murni Sewa
            </span>
            <span className="text-xl font-extrabold text-emerald-600">
              {formatIDR(summary.totalRentalIncome)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {summary.rentalCount} transaksi sewa alat &amp; studio
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            📷
          </div>
        </div>

        {/* Penalty & Damage Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Pendapatan Denda &amp; Kerusakan
            </span>
            <span className="text-xl font-extrabold text-rose-600">
              {formatIDR(summary.totalPenaltyIncome)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {summary.penaltyCount} denda / perbaikan
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
        </div>

        {/* Refund Outflow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Refund Pembatalan
            </span>
            <span className="text-xl font-extrabold text-amber-600">
              {formatIDR(summary.totalRefunds)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {summary.refundCount} pembatalan di-ACC
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            💸
          </div>
        </div>

        {/* Net Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Total Pendapatan Bersih
            </span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatIDR(summary.netRevenue)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              (Sewa + Denda) - Refund
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            📈
          </div>
        </div>
      </div>

      {/* Main Ledger Split Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("MAIN_RENTAL")}
          className={`pb-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "MAIN_RENTAL"
              ? "border-orange-700 text-orange-800"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          📊 1. Buku Kas Persewaan Utama ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("PENALTY_DAMAGE")}
          className={`pb-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "PENALTY_DAMAGE"
              ? "border-rose-700 text-rose-800"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          ⚠️ 2. Buku Kas Denda, Kerusakan &amp; Kehilangan ({penaltyTransactions.length})
        </button>
      </div>

      {/* Control Bar */}
      <div className="modern-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {activeTab === "MAIN_RENTAL" ? (
          <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setFilterCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                filterCategory === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterCategory("INCOME")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                filterCategory === "INCOME" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
              }`}
            >
              💵 Sewa Masuk ({summary.rentalCount})
            </button>
            <button
              onClick={() => setFilterCategory("REFUND")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                filterCategory === "REFUND" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500"
              }`}
            >
              💸 Refund Keluar ({summary.refundCount})
            </button>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500 font-bold">
            Daftar Tagihan Denda Keterlambatan, Perbaikan Kerusakan &amp; Ganti Rugi Kehilangan Barang
          </span>
        )}

        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Cari pelanggan, ID order, catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-modern pl-9 py-2 text-xs font-mono"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Tab 1: Main Rental Ledger */}
      {activeTab === "MAIN_RENTAL" && (
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
                    Catatan Kas
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">
                    Nominal Sewa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono">
                      Memuat buku kas sewa...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono">
                      Tidak ada transaksi sewa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t, i) => {
                    const isRefund = t.category === "REFUND";
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 align-top">
                          <div className="font-bold text-slate-900 text-xs mb-0.5 font-mono">{t.date}</div>
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
                          <div className={`text-sm font-extrabold font-mono ${isRefund ? "text-rose-600" : "text-emerald-600"}`}>
                            {isRefund ? `- ${formatIDR(t.amount)}` : `+ ${formatIDR(t.amount)}`}
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
      )}

      {/* Tab 2: Penalty, Damage & Loss Ledger */}
      {activeTab === "PENALTY_DAMAGE" && (
        <div className="modern-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Waktu &amp; Order
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Peminjam &amp; Barang
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Status Kondisi &amp; Catatan Admin
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Rincian Denda / Fee
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">
                    Total Denda &amp; Status Bayar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono">
                      Memuat laporan denda &amp; kerusakan...
                    </td>
                  </tr>
                ) : filteredPenalties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono">
                      Belum ada catatan denda keterlambatan atau kerusakan barang sewa.
                    </td>
                  </tr>
                ) : (
                  filteredPenalties.map((p, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors bg-white">
                      <td className="px-6 py-4 align-top font-mono">
                        <div className="font-bold text-slate-900 text-xs mb-0.5">{p.date}</div>
                        <div className="text-[11px] text-slate-500 font-bold">{p.trxId}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm font-bold text-slate-900">{p.user}</p>
                        <p className="text-xs text-slate-500">{p.item}</p>
                      </td>
                      <td className="px-6 py-4 align-top space-y-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                          p.conditionStatus === "DAMAGED" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                          p.conditionStatus === "LOST" ? "bg-rose-100 text-rose-900 border border-rose-300" : "bg-emerald-100 text-emerald-900"
                        }`}>
                          {p.conditionStatus === "DAMAGED" ? "🔴 RUSAK" : p.conditionStatus === "LOST" ? "❌ HILANG (TOTAL LOSS)" : "🟢 NORMAL"}
                        </span>
                        <p className="text-xs text-slate-600 italic">
                          "{p.damageNotes}"
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top font-mono text-[11px] space-y-0.5 text-slate-700">
                        {p.lateFee > 0 && <div>• Denda Overdue: {formatIDR(p.lateFee)}</div>}
                        {p.extensionFee > 0 && <div>• Biaya Extend: {formatIDR(p.extensionFee)}</div>}
                        {p.damageFee > 0 && <div>• Biaya Perbaikan: {formatIDR(p.damageFee)}</div>}
                        {p.lossFee > 0 && <div>• Ganti Rugi Hilang: {formatIDR(p.lossFee)}</div>}
                      </td>
                      <td className="px-6 py-4 align-top text-right space-y-1">
                        <div className="text-sm font-extrabold font-mono text-rose-700">
                          + {formatIDR(p.totalFee)}
                        </div>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                          p.feeStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse"
                        }`}>
                          {p.feeStatus === "PAID" ? "✓ LUNAS" : "⚠️ BELUM DIBAYAR"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
