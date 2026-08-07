"use client";
import { useAuth } from "../../context/AuthContext";
import { useAppData, Studio } from "../../context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const EMPTY_FORM = {
  name: "",
  description: "",
  pricePerHour: 0,
  capacity: 5,
  facilities: "",   // comma-separated string in form
  image: "",
  isActive: true,
};

type FormData = typeof EMPTY_FORM;

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initial?: Partial<FormData>;
}

function StudioModal({ title, onClose, onSave, initial = {} }: ModalProps) {
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ...initial });

  const set = (k: keyof FormData, v: string | number | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah berkas");
      }

      set("image", data.url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Gagal mengunggah berkas");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Studio *</label>
            <input required className="input-modern" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Contoh: Studio A" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
            <textarea className="input-modern resize-none h-24" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Deskripsikan studio ini..." />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga / Jam (Rp) *</label>
              <input required type="number" min="0" className="input-modern" value={form.pricePerHour || ""} onChange={e => set("pricePerHour", Number(e.target.value))} placeholder="250000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kapasitas (orang)</label>
              <input type="number" min="1" className="input-modern" value={form.capacity} onChange={e => set("capacity", Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fasilitas</label>
            <textarea
              className="input-modern resize-none h-24"
              value={form.facilities}
              onChange={e => set("facilities", e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: AC, WiFi, Backdrop Putih, Ruang Ganti"
            />
            <p className="text-xs text-slate-400 mt-1">Pisahkan setiap fasilitas dengan koma (,)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto Studio (Unggah Berkas / URL)</label>
            <div className="flex gap-2 mb-2">
              <input className="input-modern flex-1" value={form.image} onChange={e => set("image", e.target.value)} placeholder="Contoh: /uploads/... atau URL Unsplash" />
              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                <span>📷 Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-blue-600 font-mono animate-pulse">Mengunggah foto studio...</p>}
            {uploadError && <p className="text-xs text-rose-600 font-mono">{uploadError}</p>}
            {form.image && (
              <div className="mt-2.5 relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex w-10 h-6 rounded-full border-2 transition-colors ${form.isActive ? "bg-blue-500 border-blue-500" : "bg-slate-200 border-slate-200"}`}
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">Studio Aktif / Tersedia</span>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-2 text-sm">Batal</button>
            <button type="submit" className="btn-primary px-5 py-2 text-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageStudiosPage() {
  const { user, isAuthenticated } = useAuth();
  const { studios, addStudio, updateStudio, deleteStudio } = useAppData();
  const router = useRouter();

  const [modal, setModal] = useState<null | "add" | Studio>(null);
  const [confirmDelete, setConfirmDelete] = useState<Studio | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user && user.role === "user") router.push("/dashboard");
  }, [isAuthenticated, user, router]);

  if (!user || user.role === "user") return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toFormData = (s: Studio): FormData => ({
    name: s.name,
    description: s.description,
    pricePerHour: s.pricePerHour,
    capacity: s.capacity,
    facilities: s.facilities.join(", "),
    image: s.image || "",
    isActive: s.isActive,
  });

  const handleSave = (data: FormData) => {
    const processed = {
      ...data,
      facilities: data.facilities.split(",").map(f => f.trim()).filter(Boolean),
    };
    if (modal === "add") {
      addStudio(processed);
      showToast("Studio berhasil ditambahkan!");
    } else if (modal && typeof modal === "object") {
      updateStudio(modal.id, processed);
      showToast("Studio berhasil diperbarui!");
    }
    setModal(null);
  };

  const handleDelete = (s: Studio) => {
    deleteStudio(s.id);
    setConfirmDelete(null);
    showToast(`"${s.name}" berhasil dihapus.`);
  };

  return (
    <div className="animate-fade-up">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      {/* Modals */}
      {modal === "add" && (
        <StudioModal title="Tambah Studio Baru" onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal && typeof modal === "object" && (
        <StudioModal
          title={`Edit: ${modal.name}`}
          onClose={() => setModal(null)}
          onSave={handleSave}
          initial={toFormData(modal)}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Studio?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Anda akan menghapus <strong className="text-slate-900">{confirmDelete.name}</strong>. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary px-4 py-2 text-sm">Batal</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Ruangan Studio</h1>
          <p className="text-slate-500 text-sm">{studios.length} studio terdaftar · {studios.filter(s => s.isActive).length} aktif</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Studio
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studios.map(studio => (
          <div key={studio.id} className={`modern-card overflow-hidden flex flex-col ${!studio.isActive ? "opacity-60" : ""}`}>
            {/* Image header */}
            <div className="h-44 w-full bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-100">
              {studio.image ? (
                <img src={studio.image} alt={studio.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 font-medium text-xs">
                  Tidak ada foto
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{studio.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Kapasitas {studio.capacity} orang</div>
                </div>
                <button
                  onClick={() => updateStudio(studio.id, { isActive: !studio.isActive })}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                    studio.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${studio.isActive ? "bg-green-500" : "bg-slate-400"}`} />
                  {studio.isActive ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-4 leading-relaxed flex-1">{studio.description || "Tidak ada deskripsi."}</p>

              {/* Facilities */}
              {studio.facilities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {studio.facilities.map((f, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Harga Sewa</div>
                  <div className="text-base font-bold text-blue-600">{formatIDR(studio.pricePerHour)}<span className="text-xs font-normal text-slate-400">/jam</span></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal(studio)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(studio)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {studios.length === 0 && (
          <div className="col-span-3 modern-card p-16 flex flex-col items-center text-center text-slate-400">
            <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h18"/></svg>
            <p className="font-semibold text-slate-500">Belum ada studio</p>
            <p className="text-sm mt-1">Klik tombol "Tambah Studio" untuk mulai</p>
          </div>
        )}
      </div>
    </div>
  );
}
