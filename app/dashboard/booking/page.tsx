"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useAppData, Equipment, Studio, Service } from "@/app/context/AppDataContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BookingPage() {
  const { user, isAuthenticated } = useAuth();
  const { cart, addToCart, removeFromCart, updateCartQty, clearCart } = useAppData();
  const router = useRouter();

  // Data lists
  const [studios, setStudios] = useState<Studio[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking type: "studio" | "service" | "equipment"
  const [bookingType, setBookingType] = useState<"studio" | "service" | "equipment" | null>(null);
  const [step, setStep] = useState(1);

  // Wizard state: Studio
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [studioDate, setStudioDate] = useState("");
  const [studioStartTime, setStudioStartTime] = useState("09:00");
  const [studioEndTime, setStudioEndTime] = useState("12:00");
  const [studioNotes, setStudioNotes] = useState("");

  // Wizard state: Service
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDate, setServiceDate] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");

  // Wizard state: Equipment dates/notes
  const [equipStartDate, setEquipStartDate] = useState("");
  const [equipEndDate, setEquipEndDate] = useState("");
  const [equipNotes, setEquipNotes] = useState("");

  // Search/Filter for equipment
  const [equipSearch, setEquipSearch] = useState("");
  const [equipFilterCat, setEquipFilterCat] = useState("Semua");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [stRes, svRes, eqRes] = await Promise.all([
          fetch("/api/studios"),
          fetch("/api/services"),
          fetch("/api/equipment"),
        ]);
        if (stRes.ok) setStudios(await stRes.json());
        if (svRes.ok) setServices(await svRes.json());
        if (eqRes.ok) setEquipment(await eqRes.json());
      } catch (err) {
        console.error("Gagal mengambil data booking:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Check query params client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      if (type === "studio" || type === "service" || type === "equipment") {
        setBookingType(type);
        setStep(2);
      }
    }
  }, []);

  useEffect(() => {
    if (bookingType === "studio" && selectedStudio && studioDate) {
      setLoadingSchedules(true);
      fetch(`/api/bookings/availability?studioId=${selectedStudio.id}&date=${studioDate}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to load schedules");
        })
        .then((data) => {
          setExistingBookings(data || []);
        })
        .catch((err) => console.error("Error loading schedules:", err))
        .finally(() => setLoadingSchedules(false));
    }
  }, [bookingType, selectedStudio, studioDate]);

  if (!user) return null;

  const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

  // Helper: calculate studio duration and price
  const getStudioDurationHours = () => {
    if (!studioStartTime || !studioEndTime) return 0;
    const [startH, startM] = studioStartTime.split(":").map(Number);
    const [endH, endM] = studioEndTime.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0, diff / 60);
  };

  const getStudioTotalPrice = () => {
    if (!selectedStudio) return 0;
    const hours = getStudioDurationHours();
    return Math.round(hours * selectedStudio.pricePerHour);
  };

  // Helper: calculate equipment duration in days
  const getEquipDurationDays = () => {
    if (!equipStartDate || !equipEndDate) return 0;
    const start = new Date(equipStartDate);
    const end = new Date(equipEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return isNaN(diffDays) ? 0 : diffDays;
  };

  const getEquipTotalPrice = () => {
    const days = getEquipDurationDays();
    return cart.reduce((sum, entry) => sum + entry.equipment.pricePerDay * entry.quantity * days, 0);
  };

  // Steps validations
  const validateStep2 = () => {
    setErrorMsg("");
    if (bookingType === "studio" && !selectedStudio) {
      setErrorMsg("Pilih salah satu studio untuk disewa.");
      return false;
    }
    if (bookingType === "service" && !selectedService) {
      setErrorMsg("Pilih salah satu paket jasa fotografi.");
      return false;
    }
    if (bookingType === "equipment" && cart.length === 0) {
      setErrorMsg("Tambahkan minimal 1 alat ke keranjang sewa.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    setErrorMsg("");
    if (bookingType === "studio") {
      if (!studioDate) {
        setErrorMsg("Pilih tanggal sewa studio.");
        return false;
      }
      const hrs = getStudioDurationHours();
      if (hrs <= 0) {
        setErrorMsg("Jam selesai harus setelah jam mulai.");
        return false;
      }

      // Check overlap in client validation
      const timeToMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const newStart = timeToMinutes(studioStartTime);
      const newEnd = timeToMinutes(studioEndTime);

      for (const b of existingBookings) {
        const exStart = timeToMinutes(b.startTime);
        const exEnd = timeToMinutes(b.endTime);

        const overlapStart = Math.max(newStart, exStart);
        const overlapEnd = Math.min(newEnd + 30, exEnd + 30);

        if (overlapStart < overlapEnd) {
          let blockEndHours = Math.floor((exEnd + 30) / 60);
          const blockEndMins = (exEnd + 30) % 60;
          if (blockEndHours >= 24) blockEndHours = blockEndHours % 24;
          const blockEndStr = `${blockEndHours < 10 ? "0" : ""}${blockEndHours}:${blockEndMins < 10 ? "0" : ""}${blockEndMins}`;

          setErrorMsg(`Pemesanan bentrok! Studio sudah dipesan pada jam ${b.startTime} - ${b.endTime}. Dengan cooldown 30 menit, slot tidak tersedia hingga jam ${blockEndStr}.`);
          return false;
        }
      }
    } else if (bookingType === "service") {
      if (!serviceDate) {
        setErrorMsg("Pilih tanggal pelaksanaan jasa.");
        return false;
      }
    } else if (bookingType === "equipment") {
      if (!equipStartDate || !equipEndDate) {
        setErrorMsg("Pilih tanggal mulai dan tanggal selesai sewa.");
        return false;
      }
      const days = getEquipDurationDays();
      if (new Date(equipEndDate) < new Date(equipStartDate)) {
        setErrorMsg("Tanggal selesai sewa tidak boleh sebelum tanggal mulai.");
        return false;
      }
      if (days <= 0) {
        setErrorMsg("Durasi sewa minimal 1 hari.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !bookingType) {
      setErrorMsg("Pilih tipe pemesanan terlebih dahulu.");
      return;
    }
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    setErrorMsg("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep((prev) => prev - 1);
  };

  // Submit Booking
  const handleSubmit = async () => {
    setSubmitting(false);
    setErrorMsg("");
    setSubmitting(true);

    try {
      if (bookingType === "studio") {
        const payload = {
          userId: user.id,
          studioId: selectedStudio?.id,
          date: studioDate,
          startTime: studioStartTime,
          endTime: studioEndTime,
          duration: getStudioDurationHours(),
          totalPrice: getStudioTotalPrice(),
          notes: studioNotes,
        };

        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          router.push("/dashboard/orders");
        } else {
          const errData = await res.json();
          setErrorMsg(errData.error || "Gagal membuat booking studio.");
        }
      } else if (bookingType === "service") {
        const payload = {
          userId: user.id,
          totalAmount: selectedService?.priceStart || 0,
          startDate: serviceDate,
          endDate: serviceDate,
          notes: serviceNotes,
          items: [
            {
              serviceId: selectedService?.id,
              quantity: 1,
              duration: 1,
              price: selectedService?.priceStart || 0,
            },
          ],
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          router.push("/dashboard/orders");
        } else {
          const errData = await res.json();
          setErrorMsg(errData.error || "Gagal memesan jasa fotografi.");
        }
      } else if (bookingType === "equipment") {
        const payload = {
          userId: user.id,
          totalAmount: getEquipTotalPrice(),
          startDate: equipStartDate,
          endDate: equipEndDate,
          notes: equipNotes,
          items: cart.map((entry) => ({
            equipmentId: entry.equipment.id,
            quantity: entry.quantity,
            duration: getEquipDurationDays(),
            price: entry.equipment.pricePerDay,
          })),
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          clearCart();
          router.push("/dashboard/orders");
        } else {
          const errData = await res.json();
          setErrorMsg(errData.error || "Gagal menyewa peralatan.");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setErrorMsg("Terjadi kesalahan koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEquipment = equipment.filter((eq) => {
    if (!eq.isActive) return false;
    const matchSearch =
      eq.name.toLowerCase().includes(equipSearch.toLowerCase()) ||
      eq.brand.toLowerCase().includes(equipSearch.toLowerCase());
    const matchCat = equipFilterCat === "Semua" || eq.category === equipFilterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-4xl mx-auto py-4 animate-fade-up">
      {/* Wizard Header Status */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Penyewaan &amp; Pemesanan Layanan
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Silakan lengkapi formulir reservasi online berikut untuk studio, jasa, atau alat fotografi.
        </p>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110"
                    : step > s
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-12 h-1 bg-slate-200 rounded ${step > s ? "bg-green-500" : ""}`} />}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2 animate-fade-up">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="modern-card p-16 text-center text-slate-400">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full mb-3" role="status" />
          <p className="font-semibold text-sm">Menyinkronkan data katalog...</p>
        </div>
      ) : (
        <div className="modern-card p-6 sm:p-8 bg-white min-h-[400px] flex flex-col justify-between">
          
          {/* STEP 1: SELECT TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Langkah 1: Pilih Tipe Reservasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <button
                  type="button"
                  onClick={() => { setBookingType("studio"); setStep(2); }}
                  className={`p-6 rounded-2xl border text-left flex flex-col h-full hover:border-blue-500 hover:shadow-md transition-all group ${
                    bookingType === "studio" ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20" : "border-slate-200"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h18"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-950 text-lg mb-2">Sewa Studio</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">
                    Sewa ruang studio foto premium ber-AC, backdrop multiwarna, dan fasilitas lighting profesional.
                  </p>
                  <span className="text-xs font-bold text-blue-600 mt-4 block">Pilih Studio &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setBookingType("service"); setStep(2); }}
                  className={`p-6 rounded-2xl border text-left flex flex-col h-full hover:border-blue-500 hover:shadow-md transition-all group ${
                    bookingType === "service" ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20" : "border-slate-200"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-950 text-lg mb-2">Sewa Jasa Fotografi</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">
                    Pesan fotografer profesional Fokus untuk sesi Wedding, Prewedding, Produk, Event, Portrait, dll.
                  </p>
                  <span className="text-xs font-bold text-purple-600 mt-4 block">Pilih Layanan &rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setBookingType("equipment"); setStep(2); }}
                  className={`p-6 rounded-2xl border text-left flex flex-col h-full hover:border-blue-500 hover:shadow-md transition-all group ${
                    bookingType === "equipment" ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20" : "border-slate-200"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-950 text-lg mb-2">Sewa Alat &amp; Aksesoris</h3>
                  <p className="text-xs text-slate-500 leading-relaxed flex-1">
                    Sewa kamera DSLR/Mirrorless, lensa premium, stabilizer, tripod, dan kelengkapan lighting harian.
                  </p>
                  <span className="text-xs font-bold text-orange-600 mt-4 block">Pilih Peralatan &rarr;</span>
                </button>

              </div>
            </div>
          )}

          {/* STEP 2: SELECT ITEMS */}
          {step === 2 && (
            <div className="space-y-6">
              
              {/* Studio Selection */}
              {bookingType === "studio" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Langkah 2: Pilih Studio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studios.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudio(st)}
                        className={`p-6 rounded-2xl border cursor-pointer hover:border-blue-400 transition-all ${
                          selectedStudio?.id === st.id ? "border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/20" : "border-slate-200 bg-white"
                        }`}
                      >
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{st.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">{st.description || "Studio sewa eksklusif."}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {st.facilities.map((fac, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">{fac}</span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-400">Kapasitas: <strong className="text-slate-700">{st.capacity} orang</strong></span>
                          <span className="text-base font-extrabold text-blue-600">{formatIDR(st.pricePerHour)}/jam</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Selection */}
              {bookingType === "service" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Langkah 2: Pilih Layanan Fotografi</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((sv) => (
                      <div
                        key={sv.id}
                        onClick={() => setSelectedService(sv)}
                        className={`p-6 rounded-2xl border cursor-pointer hover:border-purple-400 transition-all ${
                          selectedService?.id === sv.id ? "border-purple-500 bg-purple-50/10 ring-2 ring-purple-500/20" : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-3 uppercase tracking-wide">{sv.category}</span>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{sv.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">{sv.description}</p>
                        
                        <div className="text-xs font-bold text-slate-800 mb-2">Termasuk:</div>
                        <ul className="text-xs text-slate-500 space-y-1 mb-4 list-disc pl-4">
                          {sv.includes.slice(0, 3).map((inc, i) => <li key={i}>{inc}</li>)}
                          {sv.includes.length > 3 && <li>dan lainnya...</li>}
                        </ul>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                          <span className="text-xs text-slate-400">Durasi: <strong className="text-slate-700">{sv.duration || "Sesuai Sesi"}</strong></span>
                          <span className="text-base font-extrabold text-purple-600">Mulai {formatIDR(sv.priceStart)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment Selection */}
              {bookingType === "equipment" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Langkah 2: Pilih Alat &amp; Keranjang</h2>
                  
                  {/* Cart Summary Header */}
                  {cart.length > 0 && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                      <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Keranjang Sewa ({cart.length} item)</div>
                      <div className="space-y-2">
                        {cart.map((entry) => (
                          <div key={entry.equipment.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-orange-100 text-xs">
                            <span className="font-bold text-slate-900">{entry.equipment.name} <span className="text-slate-400 font-normal">x{entry.quantity}</span></span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-orange-600">{formatIDR(entry.equipment.pricePerDay * entry.quantity)}/hari</span>
                              <button onClick={() => removeFromCart(entry.equipment.id)} className="text-red-500 hover:text-red-700 font-semibold font-mono">Hapus</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter and Search */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                      type="text"
                      placeholder="Cari kamera, lensa, aksesoris..."
                      value={equipSearch}
                      onChange={(e) => setEquipSearch(e.target.value)}
                      className="input-modern flex-1 text-xs py-2"
                    />
                    <div className="flex gap-2">
                      {["Semua", "Kamera", "Lensa", "Lighting", "Aksesori"].map((cat) => (
                        <button
                           key={cat}
                          onClick={() => setEquipFilterCat(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            equipFilterCat === cat
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
                    {filteredEquipment.map((eq) => {
                      const inCart = cart.find((entry) => entry.equipment.id === eq.id);
                      return (
                        <div key={eq.id} className="p-4 rounded-xl border border-slate-100 hover:border-orange-300 transition-all flex flex-col justify-between bg-slate-50/50">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{eq.brand} · {eq.category}</span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{eq.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{eq.description}</p>
                          </div>
                          
                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-400">Harga/Hari</div>
                              <div className="text-xs font-bold text-orange-600">{formatIDR(eq.pricePerDay)}</div>
                            </div>

                            {inCart ? (
                              <div className="flex items-center gap-1.5 bg-white border rounded-lg px-1 py-0.5">
                                <button
                                  onClick={() => {
                                    if (inCart.quantity === 1) removeFromCart(eq.id);
                                    else updateCartQty(eq.id, inCart.quantity - 1);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-slate-800 w-4 text-center">{inCart.quantity}</span>
                                <button
                                  onClick={() => updateCartQty(eq.id, inCart.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-100 rounded"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(eq)}
                                disabled={eq.available <= 0}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                                  eq.available <= 0
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
                              >
                                {eq.available <= 0 ? "Stok Habis" : "+ Tambah"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: CONFIGURE DATE / DETAILS */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Studio Config */}
              {bookingType === "studio" && selectedStudio && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Langkah 3: Konfigurasi Waktu &amp; Sesi</h2>
                  <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-50 border-dashed mb-6 text-sm">
                    Menyewa <strong className="text-blue-600">{selectedStudio.name}</strong> dengan tarif <strong className="text-blue-600">{formatIDR(selectedStudio.pricePerHour)}/jam</strong>.
                  </div>

                  {/* Schedule list */}
                  {studioDate && (
                    <div className="mb-6 p-4 bg-orange-50/50 border border-orange-200 rounded-none relative viewfinder-box">
                      <div className="viewfinder-corners-bottom"></div>
                      <div className="text-[10px] font-bold text-orange-850 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-700 animate-pulse"></span>
                        Jadwal Terisi & Cooldown (30 Menit)
                      </div>
                      {loadingSchedules ? (
                        <div className="text-[10px] text-slate-400 font-mono">Memeriksa ketersediaan jadwal...</div>
                      ) : existingBookings.length === 0 ? (
                        <div className="text-[10px] text-emerald-700 font-mono font-bold uppercase tracking-wider">✓ Studio kosong dan siap dipesan untuk tanggal ini.</div>
                      ) : (
                        <div className="space-y-2">
                          {existingBookings.map((b: any, idx: number) => {
                            const [eh, em] = b.endTime.split(":").map(Number);
                            let totalMins = eh * 60 + em + 30;
                            let endH = Math.floor(totalMins / 60);
                            let endM = totalMins % 60;
                            if (endH >= 24) endH = endH % 24;
                            const blockEndStr = `${endH < 10 ? "0" : ""}${endH}:${endM < 10 ? "0" : ""}${endM}`;

                            return (
                              <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-slate-600 bg-white p-2.5 border border-neutral-200">
                                <div>
                                  Pesan: <strong className="text-slate-800">{b.startTime} - {b.endTime}</strong>
                                </div>
                                <div className="text-right text-orange-800 font-bold">
                                  Terblokir s/d: {blockEndStr}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Sewa</label>
                      <input
                        type="date"
                        required
                        value={studioDate}
                        onChange={(e) => setStudioDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="input-modern py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Waktu Mulai</label>
                      <input
                        type="time"
                        required
                        value={studioStartTime}
                        onChange={(e) => setStudioStartTime(e.target.value)}
                        className="input-modern py-2 text-xs w-full block bg-white border border-[#e7e6df]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Waktu Selesai</label>
                      <input
                        type="time"
                        required
                        value={studioEndTime}
                        onChange={(e) => setStudioEndTime(e.target.value)}
                        className="input-modern py-2 text-xs w-full block bg-white border border-[#e7e6df]"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Catatan Tambahan / Konsep Pemotretan (Opsional)</label>
                    <textarea
                      value={studioNotes}
                      onChange={(e) => setStudioNotes(e.target.value)}
                      placeholder="Masukkan detail tambahan atau permintaan khusus Anda..."
                      className="input-modern h-24 resize-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Service Config */}
              {bookingType === "service" && selectedService && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Langkah 3: Konfigurasi Tanggal Pelaksanaan</h2>
                  <div className="bg-purple-50/20 p-4 rounded-xl border border-purple-50 border-dashed mb-6 text-sm">
                    Pemesanan jasa <strong className="text-purple-600">{selectedService.name}</strong> dengan estimasi awal <strong className="text-purple-600">{formatIDR(selectedService.priceStart)}</strong>.
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Pelaksanaan Kegiatan</label>
                      <input
                        type="date"
                        required
                        value={serviceDate}
                        onChange={(e) => setServiceDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="input-modern py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Detail Brief / Lokasi &amp; Konsep</label>
                    <textarea
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      placeholder="Misal: Sesi foto outdoor jam 3 sore di area Pantai Kuta, konsep santai casual..."
                      className="input-modern h-28 resize-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Equipment Config */}
              {bookingType === "equipment" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Langkah 3: Atur Waktu Penyewaan Alat</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Mulai Sewa</label>
                      <input
                        type="date"
                        required
                        value={equipStartDate}
                        onChange={(e) => setEquipStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="input-modern py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal Selesai Sewa</label>
                      <input
                        type="date"
                        required
                        value={equipEndDate}
                        onChange={(e) => setEquipEndDate(e.target.value)}
                        min={equipStartDate || new Date().toISOString().split("T")[0]}
                        className="input-modern py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Catatan Tambahan (Opsional)</label>
                    <textarea
                      value={equipNotes}
                      onChange={(e) => setEquipNotes(e.target.value)}
                      placeholder="Masukkan permohonan khusus, waktu penjemputan alat, dll..."
                      className="input-modern h-24 resize-none text-xs"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Langkah 4: Tinjauan &amp; Konfirmasi Pesanan</h2>
              
              <div className="bg-slate-50 rounded-2xl p-6 border">
                
                {bookingType === "studio" && selectedStudio && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sewa Studio</div>
                        <h3 className="text-lg font-bold text-slate-950 mt-1">{selectedStudio.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{selectedStudio.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Tarif/Jam</span>
                        <div className="text-sm font-bold text-slate-900">{formatIDR(selectedStudio.pricePerHour)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Tanggal Sewa</span>
                        <strong className="text-slate-800">{new Date(studioDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Durasi Waktu</span>
                        <strong className="text-slate-800">{studioStartTime} - {studioEndTime} ({getStudioDurationHours()} jam)</strong>
                      </div>
                    </div>

                    {studioNotes && (
                      <div className="pt-3 border-t border-slate-200 text-xs">
                        <span className="text-slate-400 block mb-1">Catatan Pelanggan</span>
                        <p className="text-slate-600 italic">"{studioNotes}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">Total Biaya Booking</span>
                      <strong className="text-lg font-extrabold text-blue-600">{formatIDR(getStudioTotalPrice())}</strong>
                    </div>
                  </div>
                )}

                {bookingType === "service" && selectedService && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div>
                        <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Jasa Fotografi</div>
                        <h3 className="text-lg font-bold text-slate-950 mt-1">{selectedService.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{selectedService.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Harga Awal</span>
                        <div className="text-sm font-bold text-slate-900">{formatIDR(selectedService.priceStart)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Tanggal Kegiatan</span>
                        <strong className="text-slate-800">{new Date(serviceDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Kategori Paket</span>
                        <strong className="text-slate-800 uppercase">{selectedService.category}</strong>
                      </div>
                    </div>

                    {serviceNotes && (
                      <div className="pt-3 border-t border-slate-200 text-xs">
                        <span className="text-slate-400 block mb-1">Brief Acara / Konsep</span>
                        <p className="text-slate-600 italic">"{serviceNotes}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">Total Pembayaran Awal</span>
                      <strong className="text-lg font-extrabold text-purple-600">{formatIDR(selectedService.priceStart)}</strong>
                    </div>
                  </div>
                )}

                {bookingType === "equipment" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 pb-4">
                      <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Sewa Alat &amp; Aksesoris</div>
                      <h3 className="text-base font-bold text-slate-950 mt-1">Daftar Peralatan yang Disewa:</h3>
                      <div className="space-y-2 mt-3">
                        {cart.map((entry) => (
                          <div key={entry.equipment.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-700">{entry.equipment.name} <strong className="text-slate-900">x{entry.quantity}</strong></span>
                            <span className="font-medium text-slate-900">{formatIDR(entry.equipment.pricePerDay * entry.quantity)} / hari</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Tanggal Rental</span>
                        <strong className="text-slate-800">
                          {new Date(equipStartDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} sd {new Date(equipEndDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Durasi Rental</span>
                        <strong className="text-slate-800">{getEquipDurationDays()} hari</strong>
                      </div>
                    </div>

                    {equipNotes && (
                      <div className="pt-3 border-t border-slate-200 text-xs">
                        <span className="text-slate-400 block mb-1">Catatan Tambahan</span>
                        <p className="text-slate-600 italic">"{equipNotes}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">Total Tarif Sewa Alat</span>
                      <strong className="text-lg font-extrabold text-orange-600">{formatIDR(getEquipTotalPrice())}</strong>
                    </div>
                  </div>
                )}

              </div>

              <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-xl text-xs flex gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed">
                  Pesanan Anda akan masuk ke status <strong>Menunggu Pembayaran</strong> setelah disubmit. Anda dapat menyimulasikan pembayaran lewat dashboard Anda untuk mengaktifkan status pesanan.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="btn-secondary py-2 px-6 text-sm font-semibold rounded-xl"
              >
                Kembali
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="btn-secondary py-2 px-6 text-sm font-semibold rounded-xl"
              >
                Batal
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary py-2 px-6 text-sm font-semibold rounded-xl"
              >
                Lanjutkan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="py-2 px-6 text-sm font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-slate-300 rounded-xl transition-all shadow-md shadow-green-500/10"
              >
                {submitting ? "Memproses..." : "Konfirmasi &amp; Bayar"}
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
