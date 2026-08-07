"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);

  // States untuk Fitur Ganti Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
      setAddress(user.address || "");
    }
  }, [isAuthenticated, user, router]);

  if (!user) return null;

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
      }
    } catch (err) {
      console.error("Gagal mengunggah foto profil:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, { name, phone, avatar, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal harus 6 karakter.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess("Kata sandi Anda berhasil diperbarui.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.message || "Gagal mengubah kata sandi.");
      }
    } catch {
      setPasswordError("Terjadi kesalahan jaringan.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Pengaturan Akun</h1>
        <p className="text-slate-500 text-sm">Kelola informasi data diri dan preferensi profil Anda.</p>
      </div>

      <div className="max-w-2xl">
        <div className="modern-card p-8">
          {saved && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm font-medium text-green-700">Profil berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative group w-20 h-20 shrink-0">
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-[9px] font-mono uppercase opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <span>Ubah</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-1">{user.role.toUpperCase()}</div>
                <div className="text-xs text-slate-500">Anggota sejak {user.joinedAt}</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Tidak bisa diubah)</label>
                <input type="email" disabled value={user.email} className="input-modern bg-slate-100 text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-modern" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon / WhatsApp</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xx..." className="input-modern" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Lengkap</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Tuliskan alamat lengkap pengiriman/sewa..."
                rows={3}
                className="input-modern"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" className="btn-primary py-2.5 px-6 shadow-md">Simpan Perubahan</button>
            </div>
          </form>
        </div>

        {/* Card Keamanan & Sandi */}
        <div className="modern-card p-8 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Keamanan &amp; Sandi</h2>
          <p className="text-slate-500 text-xs mb-6">Perbarui kata sandi untuk melindungi keamanan akun Anda.</p>

          {passwordError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-red-700">{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-green-700">{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password Lama</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-modern"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-modern"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary py-2.5 px-6 shadow-md disabled:opacity-50"
              >
                {savingPassword ? "Menyimpan..." : "Simpan Sandi"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
