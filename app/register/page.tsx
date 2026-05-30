"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = await register(name, email, password, phone, address);
    setLoading(false);
    if (result.success) router.push("/dashboard");
    else setError(result.message);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] relative">
      <Navbar />
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 border border-neutral-950 text-neutral-950 font-bold font-serif italic text-xl bg-white relative shadow-xs mb-6 group hover:border-orange-700">
            <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-950"></span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-neutral-950"></span>
            <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-neutral-950"></span>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neutral-950"></span>
            F
          </Link>
          <h2 className="text-3xl font-light font-serif text-neutral-900 leading-tight">
            Buat Akun <span className="italic font-bold text-orange-700">Baru</span>
          </h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-2">Daftar untuk mengakses layanan dan dashboard</p>
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
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                  placeholder="Masukkan nama"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 mb-2">Nomor Telepon / WA</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                  placeholder="08XXXXXXXXXX"
                />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
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
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors"
                  placeholder="Minimal 6 karakter"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-700 mb-2">Alamat Lengkap</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700 rounded-none transition-colors resize-none"
                placeholder="Tuliskan alamat lengkap pengiriman/sewa..."
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Memproses..." : "Daftar Akun"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-mono uppercase tracking-widest">
            <span className="text-slate-500">Sudah punya akun? </span>
            <Link href="/login" className="font-bold text-orange-700 hover:text-orange-950 transition-colors">
              Masuk di sini
            </Link>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
