"use client";
import { useAuth } from "../../context/AuthContext";
import { useAppData, Equipment } from "../../context/AppDataContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = ["Kamera", "Lensa", "Lighting", "Aksesori"];
const TAGS = ["", "Populer", "Premium", "Baru"];

const EMPTY_FORM = {
  name: "", category: "Kamera", brand: "", description: "", specs: "",
  pricePerDay: 0, stock: 1, available: 1, tag: "", image: "", isActive: true,
};

function formatIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

type FormData = typeof EMPTY_FORM;

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initial?: Partial<FormData>;
}

function EquipmentModal({ title, onClose, onSave, initial = {} }: ModalProps) {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Alat *</label>
              <input required className="input-modern" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Contoh: Canon EOS R5" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand / Merek *</label>
              <input required className="input-modern" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Contoh: Canon" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
              <select className="input-modern" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Badge / Tag</label>
              <select className="input-modern" value={form.tag} onChange={e => set("tag", e.target.value)}>
                {TAGS.map(t => <option key={t} value={t}>{t || "— Tidak Ada —"}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Singkat *</label>
            <input required className="input-modern" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Contoh: 45MP, 8K Video, In-Body Stabilization" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spesifikasi Teknis</label>
            <textarea className="input-modern resize-none h-20" value={form.specs} onChange={e => set("specs", e.target.value)} placeholder="Masukkan spek teknis (opsional)" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto Alat (Unggah Berkas / URL)</label>
            <div className="flex gap-2 mb-2">
              <input className="input-modern flex-1" value={form.image} onChange={e => set("image", e.target.value)} placeholder="Contoh: /uploads/... atau URL Unsplash" />
              <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200 shrink-0">
                <span>📷 Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-blue-600 font-mono animate-pulse">Mengunggah foto alat...</p>}
            {uploadError && <p className="text-xs text-rose-600 font-mono">{uploadError}</p>}
            {form.image && (
              <div className="mt-2.5 relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga / Hari (Rp) *</label>
              <input required type="number" min="0" className="input-modern" value={form.pricePerDay || ""} onChange={e => set("pricePerDay", Number(e.target.value))} placeholder="350000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stok Total</label>
              <input type="number" min="1" className="input-modern" value={form.stock} onChange={e => set("stock", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tersedia</label>
              <input type="number" min="0" className="input-modern" value={form.available} onChange={e => set("available", Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex w-10 h-6 rounded-full border-2 transition-colors ${form.isActive ? "bg-blue-500 border-blue-500" : "bg-slate-200 border-slate-200"}`}
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">Tampilkan di Katalog</span>
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

export default function ManageEquipmentPage() {
  const { user, isAuthenticated } = useAuth();
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useAppData();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Semua");
  const [modal, setModal] = useState<null | "add" | Equipment>(null);
  const [confirmDelete, setConfirmDelete] = useState<Equipment | null>(null);
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

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Semua" || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (data: FormData) => {
    if (modal === "add") {
      addEquipment(data);
      showToast("Equipment berhasil ditambahkan!");
    } else if (modal && typeof modal === "object") {
      updateEquipment(modal.id, data);
      showToast("Equipment berhasil diperbarui!");
    }
    setModal(null);
  };

  const handleDelete = (eq: Equipment) => {
    deleteEquipment(eq.id);
    setConfirmDelete(null);
    showToast(`"${eq.name}" berhasil dihapus.`);
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

      {/* Modal */}
      {modal === "add" && (
        <EquipmentModal title="Tambah Equipment Baru" onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal && typeof modal === "object" && (
        <EquipmentModal
          title={`Edit: ${modal.name}`}
          onClose={() => setModal(null)}
          onSave={handleSave}
          initial={modal}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Equipment?</h3>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Kelola Equipment Rental</h1>
          <p className="text-slate-500 text-sm">{equipment.length} item terdaftar · {equipment.filter(e => e.isActive).length} aktif</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari nama atau brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-modern pl-10"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Semua", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                filterCat === cat ? "bg-blue-500 text-white border-blue-500" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="modern-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Nama & Brand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Harga/Hari</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <p className="font-medium">Tidak ada equipment ditemukan</p>
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-250">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.brand} {item.tag && <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">{item.tag}</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatIDR(item.pricePerDay)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{item.available}<span className="text-slate-400 font-normal">/{item.stock}</span></div>
                    <div className="text-xs text-slate-400">tersedia</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateEquipment(item.id, { isActive: !item.isActive })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
                        item.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-green-500" : "bg-slate-400"}`} />
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(item)}
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
