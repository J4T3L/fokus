"use client";
import { useAuth, Role } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const { user, users, isAuthenticated, changeRole, deleteUser } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user && user.role !== "admin" && user.role !== "superuser") router.push("/dashboard");
    
    // Simple mock loading simulation to wait for AuthContext fetch
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  if (!user || (user.role !== "admin" && user.role !== "superuser")) return null;

  const filtered = users.filter((u) =>
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())) &&
    u.role // Filter valid objects just in case
  );

  const canManage = (targetRole: string) => {
    if (user.role === "admin" && targetRole === "user") return true; 
    if (user.role === "superuser") return true;
    return false;
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Kelola akses dan hak prerogatif pengguna sistem.</p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-modern pl-10"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>

      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Profil</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Kontak</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Peran</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Memuat daftar pengguna...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Tidak ada pengguna ditemukan.</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className={`transition-colors bg-white ${u.isActive === false ? "opacity-50 grayscale bg-slate-50" : "hover:bg-slate-50/50"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm ${u.isActive === false ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {u.name} {u.id === user.id && <span className="text-xs font-medium text-blue-500 ml-1">(Anda)</span>}
                          {u.isActive === false && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-2 uppercase font-bold">Nonaktif</span>}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-0.5">Gabung: {u.joinedAt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{u.email}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{u.phone || "Tidak ada nomor"}</div>
                    {u.address && (
                      <div className="text-[11px] text-slate-500 mt-1 max-w-[220px] truncate" title={u.address}>
                        📍 {u.address}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                      u.role === "superuser" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      u.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canManage(u.role as string) && u.id !== user.id && u.isActive !== false ? (
                      <div className="flex justify-end items-center gap-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as Role)}
                          className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-md focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5 cursor-pointer shadow-sm outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          {user.role === "superuser" && <option value="superuser">Super</option>}
                        </select>
                        <button
                          onClick={() => { if(confirm("Yakin hapus user ini?")) deleteUser(u.id); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus Pengguna"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
