"use client";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateCartQty } = useAppData();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPerDay = cart.reduce((sum, item) => sum + item.equipment.pricePerDay * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/dashboard/booking?type=equipment");
    } else {
      router.push("/login?redirect=/dashboard/booking?type=equipment");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans print:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 flex flex-col shadow-2xl animate-slide-left relative">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif italic">Keranjang Sewa</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">{totalItems} Item Ditambahkan</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-none border border-neutral-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                <div className="w-16 h-16 rounded-full bg-neutral-50 border border-neutral-150 flex items-center justify-center text-neutral-400 mb-4">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Keranjang Kosong</h4>
                <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">Pilih kamera atau perlengkapan terbaik di katalog kami terlebih dahulu.</p>
              </div>
            ) : (
              cart.map((entry) => (
                <div key={entry.equipment.id} className="flex gap-4 pb-6 border-b border-neutral-100 last:border-0 relative group">
                  {/* Equipment image preview */}
                  <div className="w-20 h-20 bg-slate-50 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {entry.equipment.image ? (
                      <img src={entry.equipment.image} alt={entry.equipment.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="13" r="4"/><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/></svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900 font-serif italic line-clamp-2">{entry.equipment.name}</h4>
                        <button 
                          onClick={() => removeFromCart(entry.equipment.id)}
                          className="text-slate-350 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                          title="Hapus"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-neutral-100 text-[8px] font-mono uppercase tracking-wider text-slate-500">
                        {entry.equipment.brand}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-neutral-200 bg-white">
                        <button 
                          onClick={() => {
                            if (entry.quantity === 1) removeFromCart(entry.equipment.id);
                            else updateCartQty(entry.equipment.id, entry.quantity - 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-xs text-slate-500 hover:bg-neutral-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-6 text-center">{entry.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(entry.equipment.id, entry.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-slate-500 hover:bg-neutral-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">Subtotal/hari</span>
                        <span className="text-xs font-extrabold text-orange-700">{formatIDR(entry.equipment.pricePerDay * entry.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Panel */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Estimasi Harga Sewa</span>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-orange-700">{formatIDR(subtotalPerDay)}</span>
                  <span className="text-[9px] text-slate-400 block font-mono mt-0.5">*Belum termasuk jumlah hari sewa</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-primary text-xs py-3 px-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-neutral-900/10 hover:shadow-xl transition-shadow"
              >
                <span>Lanjutkan ke Penyewaan</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
