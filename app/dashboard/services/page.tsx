"use client";
import { useAuth } from "../../context/AuthContext";
import { useAppData, Service } from "../../context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SERVICE_CATEGORIES = ["Product", "Prewedding", "Wedding", "Fashion", "Event", "Portrait"];

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const EMPTY_FORM = {
  name: "",
  category: "Product",
  description: "",
  priceStart: 0,
  duration: "",
  includes: "",    // comma-separated string in form
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

function ServiceModal({ title, onClose, onSave, initial = {} }: ModalProps) {
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Layanan *</label>
            <input required className="input-modern" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Contoh: Foto Produk & Komersial" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select className="input-modern" value={form.category} onChange={e => set("category", e.target.value)}>
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi (opsional)</label>
              <input className="input-modern" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="Contoh: 4-6 jam" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
            <textarea className="input-modern resize-none h-24" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Jelaskan layanan ini..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga Mulai Dari (Rp) *</label>
            <input required type="number" min="0" className="input-modern" value={form.priceStart || ""} onChange={e => set("priceStart", Number(e.target.value))} placeholder="500000" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Yang Termasuk</label>
            <textarea
              className="input-modern resize-none h-24"
              value={form.includes}
              onChange={e => set("includes", e.target.value)}
              placeholder="Pisahkan dengan koma, contoh: Editing profesional, File resolusi tinggi, 20 foto final"
            />
            <p className="text-xs text-slate-400 mt-1">Pisahkan setiap item dengan koma (,)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto Layanan (Unggah Berkas / URL)</label>
            <div className="flex gap-2 mb-2">
              <input className="input-modern flex-1" value={form.image} onChange={e => set("image", e.target.value)} placeholder="Contoh: /uploads/... atau URL Unsplash" />
              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                <span>📷 Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-blue-600 font-mono animate-pulse">Mengunggah foto layanan...</p>}
            {uploadError && <p className="text-xs text-rose-600 font-mono">{uploadError}</p>}
            {form.image && (
              <div className="mt-2.5 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
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
            <span className="text-sm font-medium text-slate-700">Tampilkan di Halaman Utama</span>
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

const CATEGORY_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700",
  Prewedding: "bg-rose-100 text-rose-700",
  Product: "bg-orange-100 text-orange-700",
  Fashion: "bg-purple-100 text-purple-700",
  Event: "bg-indigo-100 text-indigo-700",
  Portrait: "bg-teal-100 text-teal-700",
};

export default function ManageServicesPage() {
  const { user, isAuthenticated } = useAuth();
  const { services, addService, updateService, deleteService } = useAppData();
  const router = useRouter();

  const [modal, setModal] = useState<null | "add" | Service>(null);
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);
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

  const toFormData = (s: Service): FormData => ({
    name: s.name,
    category: s.category,
    description: s.description,
    priceStart: s.priceStart,
    duration: s.duration || "",
    includes: s.includes.join(", "),
    image: s.image || "",
    isActive: s.isActive,
  });

  const handleSave = (data: FormData) => {
    const processed = {
      ...data,
      includes: data.includes.split(",").map(i => i.trim()).filter(Boolean),
    };
    if (modal === "add") {
      addService(processed);
      showToast("Layanan berhasil ditambahkan!");
    } else if (modal && typeof modal === "object") {
      updateService(modal.id, processed);
      showToast("Layanan berhasil diperbarui!");
    }
    setModal(null);
  };

  const handleDelete = (s: Service) => {
    deleteService(s.id);
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
        <ServiceModal title="Tambah Layanan Baru" onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal && typeof modal === "object" && (
        <ServiceModal
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Layanan?</h3>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Layanan Jasa</h1>
          <p className="text-slate-500 text-sm">{services.length} layanan terdaftar · {services.filter(s => s.isActive).length} aktif</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Layanan
        </button>
      </div>

      {/* Table */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Layanan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Harga Mulai</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Durasi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    <p className="font-medium">Belum ada layanan terdaftar</p>
                  </td>
                </tr>
              ) : services.map(svc => (
                <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm mb-0.5">{svc.name}</div>
                    <div className="text-xs text-slate-400 max-w-xs truncate">{svc.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${CATEGORY_COLORS[svc.category] || "bg-slate-100 text-slate-600"}`}>
                      {svc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatIDR(svc.priceStart)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{svc.duration || "—"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateService(svc.id, { isActive: !svc.isActive })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
                        svc.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${svc.isActive ? "bg-green-500" : "bg-slate-400"}`} />
                      {svc.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal(svc)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(svc)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
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
