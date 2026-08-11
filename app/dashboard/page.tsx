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
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            Pesanan Aktif
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
          <div className="text-3xl font-bold font-serif italic text-slate-900">
            {loading ? "..." : orders.length * 25} pts
          </div>
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white border border-neutral-200 viewfinder-box rounded-none overflow-hidden relative p-1">
        <div className="viewfinder-corners-bottom"></div>
        <div className="px-6 py-5 border-b border-neutral-200 bg-white flex justify-between items-center">
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-900">
            Riwayat Pesanan Saya
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-xs font-mono uppercase tracking-widest text-orange-700 hover:text-orange-950 font-bold"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Layanan
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest text-right">
                  Biaya
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-xs font-mono uppercase text-slate-400">
                    Memuat data...
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
                  <tr key={o.id} className="bg-white hover:bg-neutral-50/50">
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{o.id}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-900 uppercase tracking-wider">
                      {o.itemStr}
                      <div className="font-serif italic text-[10px] text-slate-500 mt-0.5">{o.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest font-bold ${
                          o.status.includes("Selesai")
                            ? "border-green-300 text-green-700 bg-green-50"
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
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-orange-700 border border-orange-750 text-white viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[9px] font-mono font-bold text-orange-200 mb-1 uppercase tracking-widest">
            Total Pendapatan
          </div>
          <div className="text-2xl font-bold font-serif italic">
            {loading ? "..." : formatIDR(stats?.revenue || 0)}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-widest">
            Pesanan Menunggu
          </div>
          <div className="text-3xl font-bold font-serif italic text-orange-700">
            {loading ? "..." : stats?.pendingOrders || 0}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-widest">
            Pesanan / Sewa Aktif
          </div>
          <div className="text-3xl font-bold font-serif italic text-neutral-800">
            {loading ? "..." : stats?.activeOrders || 0}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="text-[9px] font-mono font-bold text-slate-400 mb-1 uppercase tracking-widest">
            Pelanggan Baru
          </div>
          <div className="text-3xl font-bold font-serif italic text-neutral-800">
            {loading ? "..." : `+${stats?.newCustomers || 0}`}
          </div>
        </div>
      </div>

      {/* Financial Graph & System Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Graph Card */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 viewfinder-box p-6 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Grafik Pendapatan
              </h2>
              <h3 className="font-serif italic font-bold text-slate-800 text-lg">
                Perkembangan Keuntungan (6 Bulan Terakhir)
              </h3>
            </div>
            <button
              onClick={downloadCSV}
              disabled={loading || !stats?.transactions?.length}
              className="text-[10px] font-mono font-bold text-orange-700 hover:text-orange-950 uppercase tracking-widest border border-orange-200 px-3 py-1 cursor-pointer disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>

          <div className="w-full h-[220px] flex items-center justify-center">
            {loading ? (
              <div className="text-xs font-mono uppercase text-slate-400">Memuat grafik...</div>
            ) : !stats?.monthlyEarnings || stats.monthlyEarnings.length === 0 ? (
              <div className="text-xs font-mono uppercase text-slate-400">Data tidak cukup</div>
            ) : (
              (() => {
                const data = stats.monthlyEarnings;
                const maxAmount = Math.max(...data.map((e) => e.amount), 1000000);
                const points = data
                  .map((e, idx) => {
                    const x = idx * 70 + 50;
                    const y = 170 - (e.amount / maxAmount) * 120;
                    return `${x},${y}`;
                  })
                  .join(" ");

                return (
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad-minimal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(194, 65, 12)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="rgb(194, 65, 12)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="40" y1="50" x2="480" y2="50" stroke="#f1f1ee" strokeDasharray="3,3" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f1ee" strokeDasharray="3,3" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#e4e4e0" strokeWidth="1" />

                    {data.length > 0 && (
                      <path
                        d={`M 50,170 L ${points} L ${50 + (data.length - 1) * 70},170 Z`}
                        fill="url(#chart-grad-minimal)"
                      />
                    )}

                    <polyline
                      fill="none"
                      stroke="rgb(194, 65, 12)"
                      strokeWidth="2.5"
                      points={points}
                    />

                    {data.map((e, idx) => {
                      const x = idx * 70 + 50;
                      const y = 170 - (e.amount / maxAmount) * 120;
                      return (
                        <g key={idx} className="group cursor-pointer">
                          <circle
                            cx={x}
                            cy={y}
                            r="4.5"
                            className="fill-orange-700 stroke-white stroke-[2px]"
                          />
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            className="fill-slate-900 font-mono text-[9px] font-bold"
                          >
                            {e.amount > 0 ? (e.amount / 1000000).toFixed(1) + "M" : "0"}
                          </text>
                          <text
                            x={x}
                            y="190"
                            textAnchor="middle"
                            className="fill-slate-400 font-mono text-[9px] uppercase tracking-wider font-semibold"
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

        {/* Quick Actions Card */}
        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none flex flex-col justify-between relative">
          <div className="viewfinder-corners-bottom"></div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-900 font-mono uppercase tracking-widest mb-4">
              Aksi Cepat Admin
            </h3>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/dashboard/equipment"
                className="w-full text-center py-2.5 border border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-slate-700 hover:bg-neutral-50 hover:text-slate-950 transition-colors"
              >
                + Kelola Alat &amp; Kamera
              </Link>
              <Link
                href="/dashboard/studios"
                className="w-full text-center py-2.5 border border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-slate-700 hover:bg-neutral-50 hover:text-slate-950 transition-colors"
              >
                + Kelola Studio Foto
              </Link>
              <Link
                href="/dashboard/services"
                className="w-full text-center py-2.5 border border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-slate-700 hover:bg-neutral-50 hover:text-slate-950 transition-colors"
              >
                + Kelola Paket Layanan
              </Link>
              <Link
                href="/dashboard/finance"
                className="w-full text-center py-2.5 border border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-slate-700 hover:bg-neutral-50 hover:text-slate-950 transition-colors"
              >
                📊 Laporan Keuangan
              </Link>
              <Link
                href="/dashboard/users"
                className="w-full text-center py-2.5 border border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-slate-700 hover:bg-neutral-50 hover:text-slate-950 transition-colors"
              >
                Kelola Pengguna
              </Link>
            </div>
          </div>

          {userRole === "superuser" && (
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <h3 className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest mb-2">
                Status Server
              </h3>
              <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Database</span>
                <span className="font-bold text-green-600">Normal</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 uppercase">Latency</span>
                <span className="font-bold text-orange-700">24ms</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Monitoring & Payment Preview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Active Rentals Preview */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 viewfinder-box p-1 rounded-none relative">
          <div className="viewfinder-corners-bottom"></div>
          <div className="px-6 py-5 border-b border-neutral-200 bg-white flex justify-between items-center">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-900">
                Monitoring Penyewaan Aktif
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Daftar alat dan studio yang sedang dipinjam saat ini
              </p>
            </div>
            <Link
              href="/dashboard/rentals"
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
                    Peminjam
                  </th>
                  <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Item / Unit
                  </th>
                  <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-xs font-mono uppercase text-slate-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : !stats?.activeRentalsPreview || stats.activeRentalsPreview.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-xs font-mono uppercase text-slate-400">
                      Tidak ada penyewaan aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  stats.activeRentalsPreview.map((item, idx) => (
                    <tr key={idx} className="bg-white hover:bg-neutral-50/50">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900">
                        {item.borrower}
                        <div className="text-[10px] text-slate-400 font-normal">{item.id}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-800">
                        {item.item}
                        <span className="block text-[9px] text-slate-400 uppercase">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {item.startDate} {item.endDate !== "—" ? `s/d ${item.endDate}` : ""}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-2 py-0.5 border border-blue-300 text-blue-700 bg-blue-50 text-[9px] font-mono uppercase tracking-widest font-bold">
                          {item.status}
                        </span>
                        {item.phone && item.phone !== "—" && (
                          <a
                            href={formatWaLink(item.phone)}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[9px] font-mono text-emerald-700 font-bold hover:underline mt-1"
                          >
                            WA Peminjam &rarr;
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

        {/* Payment Proof Preview & Logs Card */}
        <div className="bg-white border border-neutral-200 viewfinder-box p-6 rounded-none flex flex-col justify-between relative">
          <div className="viewfinder-corners-bottom"></div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Bukti Transfer Terbaru
              </h2>
              <Link
                href="/dashboard/payments"
                className="text-[10px] font-mono uppercase tracking-widest text-orange-700 hover:text-orange-950 font-bold"
              >
                Log Payment
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono uppercase">
                  Memuat data...
                </div>
              ) : !stats?.paymentsPreview || stats.paymentsPreview.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono uppercase">
                  Belum ada pembayaran.
                </div>
              ) : (
                stats.paymentsPreview.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-neutral-50 border border-neutral-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {p.proofImage ? (
                        <img
                          src={p.proofImage}
                          alt="Proof"
                          onClick={() => setZoomImage(p.proofImage || null)}
                          className="w-10 h-10 object-cover border border-neutral-300 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center text-[9px] font-mono text-slate-600 font-bold">
                          TUNAI
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 block">{p.user}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {p.orderNumber} &bull; {formatIDR(p.amount)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-green-700 uppercase">
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/dashboard/payments"
            className="w-full text-center py-2.5 border border-neutral-900 font-mono text-[10px] uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors mt-6"
          >
            Verifikasi Semua Payment
          </Link>
        </div>
      </div>

      {/* Proof Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-xl w-full bg-white p-2 border border-neutral-400 shadow-2xl">
            <img src={zoomImage} alt="Bukti Transfer" className="w-full max-h-[80vh] object-contain" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-black text-white px-2 py-1 font-mono text-xs cursor-pointer"
            >
              TUTUP ✕
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
            {user.role === "admin" && "Ringkasan operasional dan pesanan sistem hari ini."}
            {user.role === "superuser" && "Akses rute-super level sistem dan metrik server."}
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
