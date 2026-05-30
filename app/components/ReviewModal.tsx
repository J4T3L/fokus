"use client";
import { useState, useEffect } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(null);
      setText("");
      setSuccess(false);
      setErrorMsg("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Ulasan tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text, rating }),
      });

      if (res.ok) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal mengirim ulasan.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan koneksi ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto flex items-center justify-center p-4 font-sans print:hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-[#FAF9F5] border border-neutral-250 w-full max-w-md relative shadow-2xl rounded-none overflow-hidden p-6 animate-fade-up">
        
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-neutral-450"></div>
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-neutral-450"></div>
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-neutral-450"></div>
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-neutral-450"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors border border-neutral-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {success ? (
          /* Success Message */
          <div className="py-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center text-emerald-600 mx-auto mb-4 animate-bounce">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="font-serif italic font-bold text-base text-slate-900 mb-1">Terima Kasih!</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">Ulasan Anda sangat berarti bagi peningkatan kualitas layanan Fokus.</p>
          </div>
        ) : (
          /* Review Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="font-serif italic font-bold text-lg text-slate-950">Berikan Ulasan Anda</h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-450 mt-1">Bagikan pengalaman Anda bersama Fokus</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-250 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Stars Selector */}
            <div className="flex flex-col items-center py-2 bg-white border border-neutral-200 relative">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2">Pilih Rating Bintang</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = (hoverRating !== null ? star <= hoverRating : star <= rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <svg 
                        className={`w-7 h-7 ${isGold ? "text-amber-500 fill-amber-500" : "text-neutral-200 fill-none"}`} 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.198-.396.757-.396.955 0l2.422 4.884 5.352.772c.439.063.616.602.298.907l-3.872 3.753.914 5.309c.075.438-.387.77-.777.56L12 17.566l-4.79 2.522c-.39.206-.853-.127-.777-.56l.914-5.309-3.872-3.753c-.318-.305-.14-.845.298-.907l5.352-.772 2.422-4.884z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Testimonial Text */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450">Tulis Tanggapan Anda</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bagaimana pelayanan fotografer kami? Apakah kebersihan studio atau kualitas kamera sewaan sudah memuaskan?"
                className="w-full input-modern h-28 resize-none text-xs leading-relaxed"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-neutral-250 hover:bg-neutral-100 font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer text-center"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary font-mono text-[10px] uppercase tracking-widest py-2.5 flex items-center justify-center gap-1 cursor-pointer"
              >
                {submitting ? (
                  <div className="animate-spin inline-block w-3.5 h-3.5 border-[2px] border-white border-t-transparent rounded-full" />
                ) : (
                  "Kirim Ulasan"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
