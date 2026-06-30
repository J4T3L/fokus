"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(""); // empty means show all, or pick a date
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Modal states
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "superuser";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user && user.role === "user") router.push("/dashboard");
  }, [isAuthenticated, user, router]);

  const fetchBookings = () => {
    setLoading(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role !== "user") {
      fetchBookings();
    }
  }, [user]);

  if (!user || user.role === "user") return null;

  // Status computation for studios based on today's date
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  const getStudioStatus = (studioName: string) => {
    const inUse = todayBookings.some((b) => b.studio === studioName && b.status === "IN_USE");
    if (inUse) return { text: "Sedang Dipakai", type: "red" };

    const upcoming = todayBookings.find((b) => b.studio === studioName && b.status === "CONFIRMED");
    if (upcoming) return { text: `Booking jam ${upcoming.startTime}`, type: "yellow" };

    return { text: "Kosong (Tersedia)", type: "green" };
  };

  // Open edit modal
  const handleOpenEdit = (b: any) => {
    if (!isAdmin) return;
    setEditingBooking(b);
    setEditDate(b.date);
    setEditStart(b.startTime);
    setEditEnd(b.endTime);
    setEditStatus(b.status);
    setEditNotes(b.notes || "");
    setErrorMsg("");
  };

  // Close modal
  const handleCloseEdit = () => {
    setEditingBooking(null);
    setErrorMsg("");
  };

  // Submit edit form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          startTime: editStart,
          endTime: editEnd,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui pesanan");
      }

      // Refresh list
      fetchBookings();
      handleCloseEdit();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete booking
  const handleDelete = async () => {
    if (!editingBooking || !window.confirm("Apakah Anda yakin ingin menghapus booking ini secara permanen?")) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus pesanan");
      }

      fetchBookings();
      handleCloseEdit();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar helpers
  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const DAYS_OF_WEEK = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  // Filter logic
  const filteredBookings = filterDate
    ? bookings.filter((b) => b.date === filterDate)
    : bookings;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Jadwal & Ketersediaan Studio</h1>
          <p className="text-slate-500 text-sm">
            Pantau slot waktu sewa studio. {isAdmin && "Klik baris pesanan untuk mengubah tanggal, waktu, atau status."}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "calendar" ? "bg-orange-700 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Kalender
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-orange-700 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tabel
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase">Filter Tanggal:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white shadow-xs focus:outline-hidden focus:border-orange-700"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-xs text-orange-700 font-bold hover:text-orange-900"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Status Ruangan (Hari Ini) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="modern-card p-6 bg-white border border-neutral-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Status Ruang (Hari Ini)</h3>
            <div className="space-y-4">
              {["Studio A", "Studio B", "Studio C"].map((name) => {
                const status = getStudioStatus(name);
                return (
                  <div
                    key={name}
                    className={`flex flex-col p-3 border rounded-none ${
                      status.type === "red"
                        ? "bg-red-50/50 border-red-200"
                        : status.type === "yellow"
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-emerald-50/50 border-emerald-200"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Ruangan</span>
                    <span className="font-serif font-bold text-neutral-900">{name}</span>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          status.type === "red"
                            ? "bg-red-500 animate-pulse"
                            : status.type === "yellow"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      ></span>
                      <span
                        className={`text-xs font-bold ${
                          status.type === "red"
                            ? "text-red-700"
                            : status.type === "yellow"
                            ? "text-amber-800"
                            : "text-emerald-700"
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kalender / Tabel Jadwal */}
        {viewMode === "calendar" ? (
          /* Premium Month Calendar View */
          <div className="lg:col-span-3">
            <div className="modern-card p-6 bg-white border border-neutral-200">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-serif italic font-bold text-xl text-slate-900">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    &larr; Prev
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>

              {/* Days of Week Grid Header */}
              <div className="grid grid-cols-7 gap-2 text-center border-b border-slate-100 pb-3 mb-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty offset cells */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 border border-transparent rounded-lg"></div>
                ))}

                {/* Month Days */}
                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
                  const dayBookings = bookings.filter((b) => b.date === dateStr);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className="aspect-square p-2 border border-slate-100 rounded-lg bg-slate-50/5 hover:bg-slate-50/30 transition-colors flex flex-col justify-between group relative min-h-[90px]"
                    >
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                        {dayNum}
                      </span>

                      {/* Booking List Pills */}
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                        {dayBookings.slice(0, 3).map((b, bIdx) => (
                          <div
                            key={bIdx}
                            onClick={() => handleOpenEdit(b)}
                            className={`text-[9px] font-mono p-1 rounded-sm cursor-pointer truncate ${
                              b.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : b.status === "IN_USE"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : b.status === "CONFIRMED"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                            title={`${b.user} - ${b.studio} (${b.startTime}-${b.endTime})`}
                          >
                            {b.studio.replace("Studio ", "")}: {b.startTime}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[7px] font-mono text-slate-400 text-center">
                            +{dayBookings.length - 3} booking
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Tabel Jadwal */
          <div className="lg:col-span-3">
            <div className="modern-card overflow-hidden bg-white border border-neutral-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Tanggal &amp; Waktu</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Ruangan</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Pelanggan</th>
                      <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400">Status</th>
                      {isAdmin && (
                        <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 text-center">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                          Loading jadwal sewa...
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                          {filterDate ? "Tidak ada jadwal sewa pada tanggal tersebut." : "Belum ada riwayat booking studio."}
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((s, i) => (
                        <tr
                          key={i}
                          onClick={() => handleOpenEdit(s)}
                          className={`transition-colors ${
                            isAdmin ? "hover:bg-slate-50/80 cursor-pointer" : "hover:bg-slate-50/30"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs font-bold text-slate-700">
                              {new Date(s.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 mt-1">
                              {s.startTime} - {s.endTime} ({s.duration} jam)
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-serif font-semibold text-neutral-900 text-sm">{s.studio}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{s.user}</div>
                            <div className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1">
                              {s.notes || "Sewa Studio"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  s.status === "IN_USE"
                                    ? "bg-red-500 animate-pulse"
                                    : s.status === "COMPLETED"
                                    ? "bg-emerald-500"
                                    : s.status === "CONFIRMED"
                                    ? "bg-amber-500"
                                    : s.status === "CANCELLED"
                                    ? "bg-slate-350"
                                    : "bg-blue-500"
                                }`}
                              ></span>
                              <span
                                className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                                  s.status === "IN_USE"
                                    ? "text-red-600"
                                    : s.status === "COMPLETED"
                                    ? "text-emerald-700"
                                    : s.status === "CONFIRMED"
                                    ? "text-amber-700"
                                    : s.status === "CANCELLED"
                                    ? "text-slate-400"
                                    : "text-blue-600"
                                }`}
                              >
                                {s.status === "IN_USE"
                                  ? "Berlangsung"
                                  : s.status === "COMPLETED"
                                  ? "Selesai"
                                  : s.status === "CONFIRMED"
                                  ? "Disetujui"
                                  : s.status === "CANCELLED"
                                  ? "Dibatalkan"
                                  : "Pending"}
                              </span>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="px-2.5 py-1 border border-neutral-950 font-mono text-[9px] uppercase tracking-widest text-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors"
                              >
                                Ubah
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white border border-neutral-200 w-full max-w-md relative p-6 shadow-xl rounded-none">
            <h2 className="text-xl font-serif text-neutral-900 mb-2">Ubah Jadwal & Status</h2>
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Klien: <span className="text-slate-700 font-bold">{editingBooking.user}</span> | Studio:{" "}
              <span className="text-slate-700 font-bold">{editingBooking.studio}</span>
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Tanggal Booking
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-350 font-mono text-xs focus:outline-hidden focus:border-orange-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-350 font-mono text-xs focus:outline-hidden focus:border-orange-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-350 font-mono text-xs focus:outline-hidden focus:border-orange-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Status Pesanan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-350 bg-white font-mono text-xs focus:outline-hidden focus:border-orange-700"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED (Disetujui)</option>
                  <option value="IN_USE">IN USE (Berlangsung)</option>
                  <option value="COMPLETED">COMPLETED (Selesai)</option>
                  <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Catatan Klien / Internal
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-350 font-mono text-xs focus:outline-hidden focus:border-orange-700 resize-none"
                  placeholder="Kebutuhan sewa..."
                />
              </div>

              <div className="pt-4 flex justify-between gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Hapus
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={submitting}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
