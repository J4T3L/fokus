"use client";
import { useState, useEffect } from "react";

interface PaymentSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  onSuccess: () => void;
}

export default function PaymentSimulator({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  onSuccess,
}: PaymentSimulatorProps) {
  const [method, setMethod] = useState<"BCA" | "MANDIRI" | "QRIS" | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [midtransToken, setMidtransToken] = useState<string | null>(null);
  const [midtransLoading, setMidtransLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setSuccess(false);
      setLoading(false);
      setCopied(false);
      setMidtransToken(null);
      document.body.style.overflow = "hidden";

      // Fetch Midtrans token
      setMidtransLoading(true);
      fetch("/api/payments/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.token) {
            setMidtransToken(data.token);
            // Load midtrans script dynamically
            const snapScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
            const existingScript = document.getElementById("midtrans-snap-script");
            if (!existingScript) {
              const script = document.createElement("script");
              script.src = snapScriptUrl;
              script.id = "midtrans-snap-script";
              script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
              document.body.appendChild(script);
            }
          }
        })
        .catch((err) => console.error("Error fetching Midtrans token:", err))
        .finally(() => setMidtransLoading(false));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

  // Generate virtual account number based on orderId
  const getVaNumber = (bank: string) => {
    const code = bank === "BCA" ? "80777" : "88321";
    // Strip prefix like ORD- or STB-
    const suffix = orderId.replace("ORD-", "").replace("STB-", "").slice(0, 7).toUpperCase();
    // Map letters to numbers
    const numSuffix = suffix.split("").map(char => {
      const code = char.charCodeAt(0);
      return isNaN(Number(char)) ? (code % 10).toString() : char;
    }).join("");
    return code + numSuffix;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        id: orderId,
        paymentMethod: method === "QRIS" ? "QRIS" : `VA_${method}`,
        amount: totalAmount,
      };

      const res = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        alert("Gagal memproses simulasi pembayaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi simulator.");
    } finally {
      setLoading(false);
    }
  };

  const payWithMidtrans = () => {
    if (typeof window !== "undefined" && (window as any).snap) {
      (window as any).snap.pay(midtransToken, {
        onSuccess: function (result: any) {
          console.log("Midtrans payment success:", result);
          setSuccess(true);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        },
        onPending: function (result: any) {
          console.log("Midtrans payment pending:", result);
          alert("Pembayaran tertunda. Silakan selesaikan pembayaran Anda sesuai petunjuk Midtrans.");
          onClose();
        },
        onError: function (result: any) {
          console.error("Midtrans payment error:", result);
          alert("Pembayaran gagal. Silakan coba kembali.");
        },
        onClose: function () {
          console.log("User closed payment popup.");
        }
      });
    } else {
      alert("Memuat sistem pembayaran Midtrans... Silakan coba lagi dalam beberapa detik.");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto flex items-center justify-center p-4 font-sans print:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-[#FAF9F5] border border-neutral-250 w-full max-w-2xl relative shadow-2xl rounded-none flex flex-col md:flex-row overflow-hidden min-h-[420px] animate-fade-up">
        
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-neutral-400"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neutral-400"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neutral-400"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neutral-400"></div>

        {/* Left Section: Details */}
        <div className="w-full md:w-5/12 bg-white border-r border-neutral-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-6 text-slate-800">
              <span className="font-serif italic font-bold tracking-widest text-sm border border-neutral-900 px-1 py-0.5">F</span>
              <span className="font-mono text-xs uppercase tracking-widest font-extrabold">Fokus Checkout</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Merchant</span>
                <p className="text-xs font-bold text-slate-800 font-serif italic mt-0.5">Fokus Studio &amp; Sewa</p>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Order ID / Tagihan</span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">{orderId}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Total Pembayaran</span>
            <span className="text-xl font-black text-orange-700">{formatIDR(totalAmount)}</span>
          </div>
        </div>

        {/* Right Section: Gateway Payment Options / Screen */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between bg-[#FAF9F5]">
          
          {success ? (
            /* Success Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mb-4 animate-bounce">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="font-serif italic font-bold text-base text-slate-900 mb-1">Pembayaran Sukses!</h3>
              <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">Terima kasih. Sistem kami sedang memperbarui status pesanan Anda secara otomatis...</p>
            </div>
          ) : loading ? (
            /* Loading Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-orange-700 border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Memproses transaksi...</p>
            </div>
          ) : !method ? (
            /* Select Method Screen */
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-widest mb-4">Pilih Cara Pembayaran</h3>
                <div className="space-y-3">
                  {midtransLoading && (
                    <div className="text-center py-2 text-[10px] font-mono text-slate-400">
                      Memeriksa ketersediaan pembayaran online...
                    </div>
                  )}
                  {midtransToken && (
                    <button
                      onClick={payWithMidtrans}
                      className="w-full flex items-center justify-between p-3.5 bg-orange-700 hover:bg-orange-850 text-white transition-colors text-left group cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-white flex items-center justify-center text-[8px] font-extrabold text-orange-700 border font-mono">MIDTRANS</div>
                        <span className="text-xs font-bold text-white">Bayar Online Aman (GoPay, ShopeePay, CC, dll)</span>
                      </div>
                      <span className="text-white group-hover:translate-x-1 transition-transform text-xs">&rarr;</span>
                    </button>
                  )}

                  {/* BCA */}
                  <button 
                    onClick={() => setMethod("BCA")}
                    className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-slate-800 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-100 flex items-center justify-center text-[10px] font-extrabold text-blue-800 border font-mono">BCA</div>
                      <span className="text-xs font-bold text-slate-800">BCA Virtual Account</span>
                    </div>
                    <span className="text-slate-350 group-hover:text-slate-800 text-xs transition-colors">&rarr;</span>
                  </button>

                  {/* Mandiri */}
                  <button 
                    onClick={() => setMethod("MANDIRI")}
                    className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-slate-800 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-100 flex items-center justify-center text-[8px] font-extrabold text-blue-900 border font-mono">MANDIRI</div>
                      <span className="text-xs font-bold text-slate-800">Mandiri Virtual Account</span>
                    </div>
                    <span className="text-slate-350 group-hover:text-slate-800 text-xs transition-colors">&rarr;</span>
                  </button>

                  {/* QRIS */}
                  <button 
                    onClick={() => setMethod("QRIS")}
                    className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 hover:border-slate-800 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-100 flex items-center justify-center text-[9px] font-extrabold text-orange-700 border font-mono">QRIS</div>
                      <span className="text-xs font-bold text-slate-800">QRIS (Gopay, OVO, QR Bank)</span>
                    </div>
                    <span className="text-slate-350 group-hover:text-slate-800 text-xs transition-colors">&rarr;</span>
                  </button>

                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full text-center text-[9px] font-mono uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors mt-6 pt-4 border-t border-neutral-200 cursor-pointer"
              >
                Batalkan Pembayaran
              </button>
            </div>
          ) : (
            /* Method Instructions Screen */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-200">
                  <button onClick={() => setMethod(null)} className="text-slate-450 hover:text-slate-800 font-mono text-[9px] uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                    &larr; Kembali
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-[10px] font-bold text-slate-800 font-mono uppercase tracking-wider">{method === "QRIS" ? "Pembayaran QRIS" : `${method} Virtual Account`}</span>
                </div>

                {method === "QRIS" ? (
                  /* QRIS Mode */
                  <div className="flex flex-col items-center py-2">
                    <div className="p-3 bg-white border border-neutral-300 shadow-md flex flex-col items-center gap-2 relative">
                      {/* Fake QRIS Design */}
                      <div className="w-32 h-32 bg-slate-50 border border-neutral-200 flex flex-wrap items-center justify-center p-1.5 gap-1.5">
                        <div className="w-full text-center font-bold text-[8px] font-mono tracking-widest text-neutral-400">QRIS DIGITAL</div>
                        <div className="w-7 h-7 bg-neutral-900 rounded-xs"></div>
                        <div className="w-7 h-7 bg-neutral-900 rounded-xs"></div>
                        <div className="w-7 h-7 bg-neutral-900 rounded-xs"></div>
                        <div className="w-7 h-7 bg-neutral-450 rounded-xs animate-pulse"></div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 tracking-wider">SCAN DENGAN APLIKASI BANK/E-WALLET</span>
                    </div>
                  </div>
                ) : (
                  /* VA Mode */
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Nomor Virtual Account</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={getVaNumber(method)} 
                        className="flex-1 input-modern py-1.5 px-3 font-mono font-bold text-xs bg-slate-100 text-slate-800"
                      />
                      <button 
                        onClick={() => handleCopy(getVaNumber(method))}
                        className="px-4 py-1.5 border border-neutral-250 hover:bg-neutral-100 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-[10px] text-slate-500 font-mono space-y-1.5">
                      <div className="font-bold text-slate-700">Instruksi Transfer:</div>
                      <div>1. Gunakan M-Banking atau ATM terdekat.</div>
                      <div>2. Pilih Transfer &gt; Virtual Account.</div>
                      <div>3. Masukkan kode VA di atas.</div>
                      <div>4. Konfirmasi jumlah tagihan {formatIDR(totalAmount)}.</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Sandbox Block */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 text-[9px] font-mono text-orange-800 tracking-wide">
                  ⚠️ <strong>SANDBOX SIMULATOR:</strong> Klik tombol hijau di bawah untuk menirukan notifikasi sukses dari perbankan/QRIS secara instan.
                </div>
                <button
                  onClick={handleSimulatePayment}
                  className="w-full btn-primary bg-green-700 hover:bg-green-800 text-white font-mono text-[10px] uppercase tracking-widest py-3 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-700/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Bayar Sekarang (Simulasi)
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
