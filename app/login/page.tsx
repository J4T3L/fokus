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
  const [showDemo, setShowDemo] = useState(false);
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

          {/* Quick Access Demo Credentials */}
          <div className="mt-6 border border-neutral-200 bg-white relative">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-705 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
                Quick Access Demo Accounts
              </span>
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {showDemo && (
              <div className="border-t border-neutral-200 p-4 bg-slate-50/50 text-left">
                <p className="text-[10px] text-slate-500 font-mono mb-4 leading-relaxed">
                  Pilih salah satu akun demo di bawah ini untuk mengisi formulir masuk secara otomatis:
                </p>
                
                <div className="space-y-3">
                  {[
                    { role: "ADMIN", desc: "Kelola order, grafik keuangan, & unduh CSV", email: "admin@fokus.id", pass: "admin123", badgeClass: "bg-orange-50 text-orange-700 border-orange-200" },
                    { role: "USER", desc: "Simulasi sewa alat, booking studio & pembayaran", email: "user@fokus.id", pass: "user123", badgeClass: "bg-slate-100 text-slate-700 border-slate-350" }
                  ].map((acc) => (
                    <div key={acc.role} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-neutral-200 bg-white gap-3">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold tracking-widest uppercase ${acc.badgeClass}`}>
                            {acc.role}
                          </span>
                          <span className="text-[9px] font-mono text-slate-550 uppercase tracking-wider">{acc.email}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono leading-tight">{acc.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(acc.email);
                          setPassword(acc.pass);
                          setError("");
                        }}
                        className="shrink-0 px-3 py-1.5 border border-neutral-950 font-mono text-[9px] uppercase tracking-widest text-neutral-950 hover:bg-neutral-950 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Use Account
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
