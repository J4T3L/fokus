"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Hide widget on dashboard and auth pages
    const isDashboardOrAuth =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register");
    setShow(!isDashboardOrAuth);
  }, [pathname]);

  if (!show) return null;

  const phoneNumber = "6281222200110"; // Admin phone number fallback
  const message = encodeURIComponent("Halo Admin Fokus, saya ingin bertanya tentang layanan studio/kamera.");
  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group cursor-pointer"
      aria-label="Chat via WhatsApp"
    >
      {/* Tooltip */}
      <span className="hidden sm:inline-block bg-neutral-900 text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs">
        Tanya via WhatsApp
      </span>

      {/* Button Circle */}
      <div className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center relative hover:bg-emerald-700 transition-colors shadow-lg">
        {/* Radar Pulse Effect */}
        <span className="absolute inset-0 w-full h-full bg-emerald-500 animate-ping opacity-25 rounded-none pointer-events-none"></span>

        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.467 0 9.92-4.447 9.922-9.913.002-2.646-1.02-5.133-2.88-6.995-1.859-1.863-4.332-2.893-6.977-2.893-5.47 0-9.925 4.45-9.927 9.917-.001 1.527.417 3.023 1.214 4.346l-.995 3.637 3.733-.977zm11.456-7.514c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.02-.462.13-.61.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.51-.66-.52-.167-.009-.36-.01-.554-.01-.194 0-.51.073-.778.365-.268.291-1.023 1.002-1.023 2.443s1.047 2.83 1.192 3.023c.146.194 2.062 3.15 4.996 4.414.698.301 1.243.481 1.667.615.7.223 1.338.192 1.843.117.563-.083 1.77-.724 2.02-1.417.25-.693.25-1.288.175-1.418-.075-.13-.275-.205-.575-.355z" />
        </svg>
      </div>
    </a>
  );
}
