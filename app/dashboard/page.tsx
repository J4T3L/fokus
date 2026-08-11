"use client";
import { useAuth, User } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface StatData {
  revenue: number;
  pendingOrders: number;
  activeOrders: number;
  newCustomers: number;
  activeRentalsPreview: {
    id: string;
    category: string;
    borrower: string;
    phone: string;
    item: string;
    startDate: string;
    endDate: string;
    status: string;
    amount: number;
  }[];
  paymentsPreview: {
    id: string;
    orderNumber: string;
    user: string;
    amount: number;
    method: string;
    status: string;
    proofImage?: string | null;
    date: string;
  }[];
  systemLogs: { id: string; time: string; action: string }[];
  monthlyEarnings: { month: string; amount: number }[];
  transactions: { id: string; date: string; user: string; type: string; amount: number }[];
}

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function UserView({ user }: { user: User }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setOrders(d || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user.id]);

  const activeCount = orders.filter((o) => o.status === "Aktif" || o.status === "Diproses").length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-between">
            <span>Pesanan Aktif</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-3xl font-bold font-serif italic text-orange-700">
            {loading ? "..." : activeCount}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Total Pengeluaran
          </div>
          <div className="text-3xl font-bold font-serif italic text-slate-900">
            {loading
              ? "..."
              : formatIDR(
                  orders.reduce(
                    (sum, o) => sum + parseInt(o.amount.replace(/\D/g, "") || "0"),
                    0
                  )
                )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Poin Reward Fokus
          </div>
          <div className="text-3xl font-bold font-serif italic text-amber-600">
            {loading ? "..." : orders.length * 25} pts
          </div>
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white border border-neutral-200 viewfinder-box rounded-none overflow-hidden relative p-1">
        <div className="viewfinder-corners-bottom"></div>
        <div className="px-6 py-5 border-b border-neutral-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-slate-900 font-bold">
              Riwayat Transaksi Saya
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Daftar pesanan sewa alat dan booking studio Anda
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-mono uppercase tracking-widest text-orange-700 hover:text-orange-950 font-bold"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  ID Pesanan
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Layanan / Item
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest text-right">
                  Total Tagihan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-xs font-mono uppercase text-slate-400">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-xs font-mono uppercase text-slate-400">
                    Belum ada pesanan terdaftar.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="bg-white hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600">{o.id}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-900 uppercase tracking-wider">
                      {o.itemStr}
                      <div className="font-serif italic text-[10px] text-slate-400 mt-0.5">{o.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 border text-[9px] font-mono uppercase tracking-widest font-bold rounded-xs ${
                          o.status.includes("Selesai")
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : o.status.includes("Dibatalkan")
                            ? "border-rose-300 text-rose-700 bg-rose-50"
                            : "border-orange-350 text-orange-700 bg-orange-50"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900 text-right">
                      {o.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminView({ userRole }: { userRole: string }) {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<"LINE" | "BAR">("LINE");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const downloadCSV = () => {
    if (!stats || !stats.transactions) return;
    const headers = ["ID Transaksi", "Tanggal", "Nama Pelanggan", "Tipe Layanan", "Total Tagihan (IDR)"];
    const rows = stats.transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.user}"`,
      `"${t.type}"`,
      t.amount,
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_keuangan_fokus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatWaLink = (phoneStr?: string) => {
    if (!phoneStr || phoneStr === "—") return "#";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Telemetry Bar & Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-400 block">
              FOKUS OVERVIEW SYSTEM v2.0
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Server status: <span className="text-emerald-400 font-bold">ONLINE (24ms)</span> &bull; Telemetri Realtime
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
          <button
            onClick={downloadCSV}
            disabled={loading || !stats?.transactions?.length}
            className="px-3.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-orange-700 via-orange-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute right-3 bottom-3 text-orange-500/20 text-6xl font-serif italic">Rp</div>
          <div className="text-[10px] font-mono font-bold text-orange-200 uppercase tracking-widest mb-1.5">
            Total Pendapatan Lunas
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-serif italic">
            {loading ? "..." : formatIDR(stats?.revenue || 0)}
          </div>
          <span className="text-[10px] text-orange-300 font-mono block mt-2">
            ▲ Terverifikasi dari pesanan &amp; booking studio
          </span>
        </div>

        {/* Pending Orders */}
        <Link
          href="/dashboard/orders"
          className="bg-white border border-amber-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all group relative cursor-pointer"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest">
              Pesanan Menunggu (Pending)
            </span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-mono font-bold rounded">
              Aksi Butuh
            </span>
          </div>
          <div className="text-3xl font-bold font-serif italic text-amber-600 group-hover:scale-105 transition-transform">
            {loading ? "..." : stats?.pendingOrders || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-2">
            Klik untuk konfirmasi bayar &amp; pesanan &rarr;
          </span>
        </Link>

        {/* Active Rentals */}
        <Link
          href="/dashboard/rentals"
          className="bg-white border border-blue-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all group relative cursor-pointer"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-widest">
              Unit Dipinjam / Sesi Aktif
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-mono font-bold rounded">
              Live
            </span>
          </div>
          <div className="text-3xl font-bold font-serif italic text-blue-900 group-hover:scale-105 transition-transform">
            {loading ? "..." : stats?.activeOrders || 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-2">
            Pantau sewa alat &amp; jadwal studio &rarr;
          </span>
        </Link>

        {/* New Customers */}
        <div className="bg-white border border-emerald-200 p-6 rounded-2xl shadow-xs relative">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-widest">
              Pelanggan Terdaftar
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded">
              Member
            </span>
          </div>
          <div className="text-3xl font-bold font-serif italic text-slate-900">
            {loading ? "..." : `+${stats?.newCustomers || 0}`}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-2">
            Pengguna aktif terverifikasi di sistem
          </span>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-3.5">
          ⚡ DOCK AKSI CEPAT ADMIN
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/equipment"
            className="p-3 bg-slate-800 hover:bg-orange-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-orange-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">📷</span>
            <span>+ Tambah Alat</span>
          </Link>
          <Link
            href="/dashboard/studios"
            className="p-3 bg-slate-800 hover:bg-orange-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-orange-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">🎙️</span>
            <span>+ Tambah Studio</span>
          </Link>
          <Link
            href="/dashboard/services"
            className="p-3 bg-slate-800 hover:bg-orange-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-orange-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">💼</span>
            <span>+ Buat Layanan</span>
          </Link>
          <Link
            href="/dashboard/finance"
            className="p-3 bg-slate-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-emerald-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">📊</span>
            <span>Kas Keuangan</span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="p-3 bg-slate-800 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-blue-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">💳</span>
            <span>Rekap Payment</span>
          </Link>
          <Link
            href="/dashboard/chat"
            className="p-3 bg-slate-800 hover:bg-purple-700 text-white rounded-xl text-xs font-mono font-bold text-center transition-all border border-slate-700 hover:border-purple-500 shadow-xs flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-base">💬</span>
            <span>Live Chat</span>
          </Link>
        </div>
      </div>

      {/* Chart Section & System Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive SVG Chart */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Grafik Tren Pendapatan
              </h2>
              <h3 className="font-serif italic font-bold text-slate-900 text-lg">
                Perkembangan Omset (6 Bulan Terakhir)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200">
                <button
                  onClick={() => setChartMode("LINE")}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                    chartMode === "LINE"
                      ? "bg-orange-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📈 Line Chart
                </button>
                <button
                  onClick={() => setChartMode("BAR")}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                    chartMode === "BAR"
                      ? "bg-orange-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📊 Bar Chart
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-[240px] flex items-center justify-center">
            {loading ? (
              <div className="text-xs font-mono uppercase text-slate-400">Memuat grafik...</div>
            ) : !stats?.monthlyEarnings || stats.monthlyEarnings.length === 0 ? (
              <div className="text-xs font-mono uppercase text-slate-400">Data tidak cukup</div>
            ) : (
              (() => {
                const data = stats.monthlyEarnings;
                const maxAmount = Math.max(...data.map((e) => e.amount), 1000000);

                if (chartMode === "BAR") {
                  return (
                    <div className="w-full h-full flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-slate-200">
                      {data.map((e, idx) => {
                        const heightPercent = Math.max((e.amount / maxAmount) * 100, 8);
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <span className="text-[10px] font-mono font-bold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatIDR(e.amount)}
                            </span>
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full bg-gradient-to-t from-orange-800 via-orange-600 to-amber-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-md"
                            ></div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                              {e.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Line mode
                const points = data
                  .map((e, idx) => {
                    const x = idx * 80 + 40;
                    const y = 180 - (e.amount / maxAmount) * 130;
                    return `${x},${y}`;
                  })
                  .join(" ");

                return (
                  <svg className="w-full h-full" viewBox="0 0 500 210" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad-new" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(194, 65, 12)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="rgb(194, 65, 12)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="30" y1="50" x2="480" y2="50" stroke="#f1f1ee" strokeDasharray="3,3" />
                    <line x1="30" y1="110" x2="480" y2="110" stroke="#f1f1ee" strokeDasharray="3,3" />
                    <line x1="30" y1="180" x2="480" y2="180" stroke="#e4e4e0" strokeWidth="1.5" />

                    {data.length > 0 && (
                      <path
                        d={`M 40,180 L ${points} L ${40 + (data.length - 1) * 80},180 Z`}
                        fill="url(#chart-grad-new)"
                      />
                    )}

                    <polyline
                      fill="none"
                      stroke="rgb(194, 65, 12)"
                      strokeWidth="3"
                      points={points}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {data.map((e, idx) => {
                      const x = idx * 80 + 40;
                      const y = 180 - (e.amount / maxAmount) * 130;
                      return (
                        <g key={idx} className="group cursor-pointer">
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            className="fill-orange-700 stroke-white stroke-[2.5px] group-hover:r-7 transition-all"
                          />
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            className="fill-slate-900 font-mono text-[10px] font-bold"
                          >
                            {e.amount > 0 ? (e.amount / 1000000).toFixed(1) + "M" : "0"}
                          </text>
                          <text
                            x={x}
                            y="200"
                            textAnchor="middle"
                            className="fill-slate-500 font-mono text-[9px] uppercase tracking-wider font-semibold"
                          >
                            {e.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white border border-neutral-200 viewfinder-box p-1 rounded-none relative flex flex-col justify-between">
          <div className="viewfinder-corners-bottom"></div>
          <div className="px-5 py-4 border-b border-neutral-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
              📋 Log Aktivitas Sistem
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-[10px] font-mono uppercase tracking-widest text-orange-700 hover:underline font-bold"
            >
              Kelola Order
            </Link>
          </div>

          <div className="p-2 flex-1 max-h-[220px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs font-mono uppercase text-slate-400">
                Memuat log...
              </div>
            ) : !stats?.systemLogs || stats.systemLogs.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono uppercase text-slate-400">
                Tidak ada riwayat.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {stats.systemLogs.map((log) => (
                  <li key={log.id} className="p-2.5 hover:bg-neutral-50 text-xs font-mono flex items-start gap-2">
                    <span className="text-slate-400 text-[10px] shrink-0 font-bold mt-0.5">{log.time}</span>
                    <span className="text-slate-700 text-[11px] font-medium leading-tight">{log.action}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Active Rentals Preview Widget */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="flex justify-between items-center mb-4 border-b border-neutral-200 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-700 font-bold block">
                LIVE MONITORING
              </span>
              <h3 className="font-serif italic font-bold text-slate-900 text-lg">
                Penyewaan Alat &amp; Booking Studio Berlangsung
              </h3>
            </div>
            <Link
              href="/dashboard/rentals"
              className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-orange-700 transition-colors"
            >
              Buka Full Monitoring &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-400 uppercase">Pelanggan</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-400 uppercase">Item / Unit</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-400 uppercase">Jadwal / Waktu</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-slate-400 uppercase text-right">Status &amp; Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">
                      Memuat penyewaan aktif...
                    </td>
                  </tr>
                ) : !stats?.activeRentalsPreview || stats.activeRentalsPreview.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-mono">
                      Tidak ada unit alat/studio yang sedang dipinjam saat ini.
                    </td>
                  </tr>
                ) : (
                  stats.activeRentalsPreview.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 align-top font-bold text-slate-900">
                        {item.borrower}
                        <span className="block text-[10px] font-mono font-normal text-slate-400">{item.id}</span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="font-bold text-slate-800 block">{item.item}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 inline-block mt-0.5">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-[11px] text-slate-600">
                        {item.startDate} {item.endDate !== "—" ? `s/d ${item.endDate}` : ""}
                      </td>
                      <td className="px-4 py-3 align-top text-right space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          {item.status}
                        </span>
                        {item.phone && item.phone !== "—" && (
                          <a
                            href={formatWaLink(item.phone)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-emerald-600 font-bold hover:underline block text-right"
                          >
                            📱 Chat WA
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments Preview Card */}
        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative flex flex-col justify-between">
          <div className="viewfinder-corners-bottom"></div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-900">
                💳 Bukti Pembayaran Terbaru
              </h3>
              <Link
                href="/dashboard/payments"
                className="text-[10px] font-mono uppercase tracking-widest text-orange-700 hover:underline font-bold"
              >
                Semua Payment
              </Link>
            </div>
            <p className="text-slate-500 text-xs font-mono mb-4">
              Pratinjau cepat resi transfer yang diunggah pelanggan:
            </p>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono">
                  Memuat bukti transfer...
                </div>
              ) : !stats?.paymentsPreview || stats.paymentsPreview.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono">
                  Belum ada unggahan pembayaran.
                </div>
              ) : (
                stats.paymentsPreview.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {p.proofImage ? (
                        <img
                          src={p.proofImage}
                          alt="Proof"
                          onClick={() => setZoomImage(p.proofImage || null)}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-300 cursor-pointer hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-[9px] font-mono text-slate-500 font-bold">
                          CASH
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{p.user}</span>
                        <span className="text-[10px] font-mono text-slate-500">{p.orderNumber} &bull; {formatIDR(p.amount)}</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/dashboard/payments"
            className="w-full btn-secondary text-xs text-center py-2.5 mt-4 block"
          >
            Verifikasi Semua Pembayaran &rarr;
          </Link>
        </div>
      </div>

      {/* Proof Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white p-2 rounded-2xl overflow-hidden">
            <img src={zoomImage} alt="Zoomed Proof" className="w-full max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full font-bold hover:bg-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-serif text-slate-900 leading-tight">
            Halo, <span className="italic font-bold text-orange-700">{user.name}</span>
          </h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">
            {user.role === "user" && "Kelola pesanan dan aktivitas penyewaan Anda di sini."}
            {user.role === "admin" && "Ringkasan operasional, grafik omset &amp; preview penyewaan sistem."}
            {user.role === "superuser" && "Akses rute-super level sistem, telemetri &amp; metrik server."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 border border-neutral-900 font-mono text-[10px] uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors rounded-none"
          >
            Profile Setting
          </Link>
        </div>
      </div>

      {user.role === "user" && <UserView user={user} />}
      {(user.role === "admin" || user.role === "superuser") && <AdminView userRole={user.role} />}
    </div>
  );
}
