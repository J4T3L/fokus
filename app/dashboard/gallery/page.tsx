"use client";
import { useAuth } from "../../context/AuthContext";
import { useAppData, Portfolio } from "../../context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const PORTFOLIO_CATEGORIES = ["Wedding", "Product", "Fashion", "Portrait", "Event", "Arsitektur"];

const EMPTY_FORM = {
  title: "",
  category: "Wedding",
  image: "",
  description: "",
  isFeatured: false,
};

type FormData = typeof EMPTY_FORM;

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initial?: Partial<FormData>;
}

function GalleryModal({ title, onClose, onSave, initial = {} }: ModalProps) {
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ...initial });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

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
    if (!form.title || !form.category || !form.image) return;
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Karya / Proyek *</label>
            <input required className="input-modern" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Contoh: Prewedding Budi & Susi" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori *</label>
            <select className="input-modern" value={form.category} onChange={e => set("category", e.target.value)}>
              {PORTFOLIO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto Karya *</label>
            <div className="relative">
              {form.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200 shadow-sm bg-slate-50">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer bg-white text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
                      Ganti Foto
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    </label>
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="bg-red-650 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m14.74 9-.34 9m-4.78 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${uploadError ? "border-red-350 bg-red-50/50 hover:bg-red-50" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400"}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                  
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Mengunggah...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-500">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700 mb-1">Pilih Berkas Foto</span>
                      <span className="text-[10px] text-slate-400 text-center leading-normal">Mendukung format JPG, PNG, atau WEBP</span>
                    </>
                  )}
                </label>
              )}
            </div>
            {uploadError && (
              <p className="mt-2 text-xs font-mono text-red-600 flex items-center gap-1">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Singkat (opsional)</label>
            <textarea className="input-modern resize-none h-20" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tuliskan latar belakang atau detail proyek..." />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isFeatured}
              onClick={() => set("isFeatured", !form.isFeatured)}
              className={`relative inline-flex w-10 h-6 rounded-full border-2 transition-colors ${form.isFeatured ? "bg-blue-500 border-blue-500" : "bg-slate-200 border-slate-200"}`}
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${form.isFeatured ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <div>
              <span className="text-sm font-medium text-slate-700 block">Karya Unggulan</span>
              <span className="text-xs text-slate-400">Tampilkan sebagai prioritas utama di galeri landing page</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-2 text-sm" disabled={uploading}>Batal</button>
            <button 
              type="submit" 
              className="btn-primary px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !form.title || !form.image}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700",
  Product: "bg-orange-100 text-orange-700",
  Fashion: "bg-purple-100 text-purple-700",
  Portrait: "bg-teal-100 text-teal-700",
  Event: "bg-indigo-100 text-indigo-700",
  Arsitektur: "bg-blue-100 text-blue-700",
};

export default function ManageGalleryPage() {
  const { user, isAuthenticated } = useAuth();
  const { portfolio, addPortfolio, updatePortfolio, deletePortfolio } = useAppData();
  const router = useRouter();

  const [modal, setModal] = useState<null | "add" | Portfolio>(null);
  const [confirmDelete, setConfirmDelete] = useState<Portfolio | null>(null);
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

  const toFormData = (p: Portfolio): FormData => ({
    title: p.title,
    category: p.category,
    image: p.image,
    description: p.description || "",
    isFeatured: p.isFeatured,
  });

  const handleSave = (data: FormData) => {
    if (modal === "add") {
      addPortfolio(data);
      showToast("Karya berhasil ditambahkan ke galeri!");
    } else if (modal && typeof modal === "object") {
      updatePortfolio(modal.id, data);
      showToast("Karya berhasil diperbarui!");
    }
    setModal(null);
  };

  const handleDelete = (p: Portfolio) => {
    deletePortfolio(p.id);
    setConfirmDelete(null);
    showToast(`"${p.title}" berhasil dihapus.`);
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
        <GalleryModal title="Tambah Karya Galeri Baru" onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal && typeof modal === "object" && (
        <GalleryModal
          title={`Edit Karya: ${modal.title}`}
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Karya Galeri?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Anda akan menghapus karya <strong className="text-slate-900">{confirmDelete.title}</strong>. Tindakan ini tidak bisa dibatalkan.
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Galeri &amp; Portfolio</h1>
          <p className="text-slate-500 text-sm">
            {portfolio.length} karya terdaftar · {portfolio.filter(p => p.isFeatured).length} karya unggulan (featured)
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Karya
        </button>
      </div>

      {/* Grid of Portfolio Cards with Actions */}
      {portfolio.length === 0 ? (
        <div className="modern-card p-16 text-center text-slate-400 bg-white">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
          </svg>
          <p className="font-semibold text-base mb-1">Belum ada karya galeri terdaftar</p>
          <p className="text-xs text-slate-400">Silakan tambahkan karya pertama Anda dengan mengeklik tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {portfolio.map(p => (
            <div key={p.id} className="modern-card bg-white overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow border border-slate-100">
              <div>
                {/* Image Thumbnail Container */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-50">
                  <img
                    src={p.image}
                    alt={p.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600";
                    }}
                    className="w-full h-full object-cover"
                  />
                  {p.isFeatured && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                      ★ Featured
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_COLORS[p.category] || "bg-slate-100 text-slate-600"}`}>
                      {p.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description || "Tidak ada deskripsi."}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(-6).toUpperCase()}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal(p)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
