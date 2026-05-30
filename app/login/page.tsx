"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = await login(email, password);
    setLoading(false);
    if (result.success) router.push("/dashboard");
    else setError(result.message);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] relative">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-12 h-12 border border-neutral-950 text-neutral-950 font-bold font-serif italic text-xl bg-white relative shadow-xs mb-6 group hover:border-orange-700">
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-950"></span>
              <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-neutral-950"></span>
              <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-neutral-950"></span>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neutral-950"></span>
              F
            </Link>
            <h2 className="text-3xl font-light font-serif text-neutral-900 leading-tight">
              Selamat Datang <span className="italic font-bold text-orange-700">Kembali</span>
            </h2>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-2">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <div className="bg-white border border-neutral-200 viewfinder-box p-8 rounded-none relative">
            <div className="viewfinder-corners-bottom"></div>
            <div className="viewfinder-center text-orange-600"></div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span className="text-xs font-mono uppercase tracking-wider text-red-600">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-700">Password</label>
                  <a href="#" className="text-xs font-mono uppercase tracking-widest text-orange-700 hover:text-orange-950 transition-colors">Lupa sandi?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? "Memproses..." : "Masuk Akun"}
              </button>
            </form>

            <div className="mt-8 text-center text-xs font-mono uppercase tracking-widest">
              <span className="text-slate-500">Belum punya akun? </span>
              <Link href="/register" className="font-bold text-orange-700 hover:text-orange-950 transition-colors">
                Daftar sekarang
              </Link>
            </div>
          </div>

          {/* Demo Accounts - Digunakan untuk mempermudah login pengujian aplikasi */}
          {/* <div className="mt-8 text-center bg-white border border-neutral-200 p-4">
          <p className="mb-1 text-[9px] font-bold text-slate-450 font-mono uppercase tracking-widest">Demo Akun (Klik Untuk Mengisi)</p>
          <p className="mb-3 text-[8px] text-slate-400 font-mono">Gunakan akun Admin untuk mengakses Laporan Keuangan/Grafik SVG, atau akun User untuk simulasi Sewa &amp; Pembayaran.</p>
          <div className="flex flex-col gap-2">
            {[
              { role: "Admin", email: "admin@fokus.id", pass: "admin123" },
              { role: "User", email: "user@fokus.id", pass: "user123" },
            ].map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.pass); setError(""); }}
                className="px-3 py-1.5 border border-neutral-200 font-mono text-[9px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {acc.role}: {acc.email}
              </button>
            ))}
          </div>
        </div> */}

        </div>
      </div>
    </div>
  );
}
