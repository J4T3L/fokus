"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ChatWindow from "../components/ChatWindow";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Beranda Dashboard",
    href: "/dashboard",
    roles: ["user", "admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: "Sewa / Booking Baru",
    href: "/dashboard/booking",
    roles: ["user", "admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    label: "Pesanan Saya",
    href: "/dashboard/orders",
    roles: ["user", "admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    label: "Profil Saya",
    href: "/dashboard/profile",
    roles: ["user", "admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  // ─── Admin+ ───────────────
  {
    label: "Monitoring Sewa",
    href: "/dashboard/rentals",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: "Kelola Equipment",
    href: "/dashboard/equipment",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    label: "Kelola Studio",
    href: "/dashboard/studios",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h18"/>
      </svg>
    ),
  },
  {
    label: "Kelola Layanan",
    href: "/dashboard/services",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
  {
    label: "Kelola Galeri",
    href: "/dashboard/gallery",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    label: "Rekap Pembayaran",
    href: "/dashboard/payments",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Jadwal Studio",
    href: "/dashboard/schedule",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Kelola Pengguna",
    href: "/dashboard/users",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Chat Pelanggan",
    href: "/dashboard/chat",
    roles: ["admin", "superuser"],
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superuser")) return;

    const fetchUnread = () => {
      fetch(`/api/chat?userId=${user.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Chat fetch failed");
        })
        .then(threads => {
          if (Array.isArray(threads)) {
            const sum = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
            setUnreadChatCount(sum);
          }
        })
        .catch(err => console.error(err));
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-mono text-xs text-slate-400 uppercase tracking-widest">
        Memuat Dashboard...
      </div>
    );
  }

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#FAF9F5] border-r border-[#e7e6df]">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#e7e6df] bg-white">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-neutral-950 flex items-center justify-center text-neutral-950 font-bold relative font-serif italic text-sm transition-colors group-hover:border-orange-700 group-hover:text-orange-700">
            <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-neutral-950"></span>
            <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-neutral-950"></span>
            <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-neutral-950"></span>
            <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-neutral-950"></span>
            F
          </div>
          <span className="font-bold text-base text-slate-900 tracking-widest font-mono uppercase transition-colors group-hover:text-orange-700">Fokus</span>
        </Link>
      </div>

      {/* User badge */}
      <div className="px-4 py-4 border-b border-[#e7e6df]">
        <div className="flex items-center gap-3 bg-white border border-neutral-200 p-3 rounded-none relative viewfinder-box">
          <div className="viewfinder-corners-bottom"></div>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-9 h-9 border border-neutral-300 object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 border border-neutral-300 text-slate-800 font-serif italic font-bold text-sm flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate font-serif italic">{user.name}</div>
            <span className={`inline-flex items-center px-2 py-0.5 border text-[8px] font-mono font-bold uppercase tracking-widest ${
              user.role === "superuser" ? "border-purple-300 text-purple-700" :
              user.role === "admin" ? "border-orange-300 text-orange-700" :
              "border-slate-300 text-slate-600"
            }`}>{user.role}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {user.role !== "user" && (
          <div className="px-3 mb-2">
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Menu Saya</p>
          </div>
        )}
        {visibleItems.slice(0, 3).map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 border font-mono text-[10px] uppercase tracking-widest transition-all ${
              isActive(item.href)
                ? "bg-orange-700 text-white border-orange-700"
                : "text-slate-700 border-transparent hover:bg-neutral-100 hover:text-slate-950"
            }`}
          >
            <span className={isActive(item.href) ? "text-white" : "text-slate-400"}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {user.role !== "user" && (
          <>
            <div className="px-3 pt-4 mb-2">
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Manajemen</p>
            </div>
            {visibleItems.slice(3).map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 border font-mono text-[10px] uppercase tracking-widest transition-all ${
                  isActive(item.href)
                    ? "bg-orange-700 text-white border-orange-700"
                    : "text-slate-700 border-transparent hover:bg-neutral-100 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive(item.href) ? "text-white" : "text-slate-400"}>{item.icon}</span>
                  {item.label}
                </div>
                {item.label === "Chat Pelanggan" && unreadChatCount > 0 && (
                  <span className={`font-bold text-[8px] w-4 h-4 flex items-center justify-center shrink-0 ${
                    isActive(item.href) ? "bg-white text-orange-750" : "bg-orange-750 text-white"
                  }`}>
                    {unreadChatCount}
                  </span>
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#e7e6df] space-y-2">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Kembali ke Beranda
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-neutral-950/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-72 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile Top Bar */}
        <header className="lg:hidden bg-[#FAF9F5] border-b border-[#e7e6df] px-4 h-14 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-700"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 border border-neutral-950 flex items-center justify-center text-neutral-950 font-bold relative font-serif italic text-xs">
              <span className="absolute top-0 left-0 w-0.5 h-0.5 border-t border-l border-neutral-950"></span>
              <span className="absolute top-0 right-0 w-0.5 h-0.5 border-t border-r border-neutral-950"></span>
              <span className="absolute bottom-0 left-0 w-0.5 h-0.5 border-b border-l border-neutral-950"></span>
              <span className="absolute bottom-0 right-0 w-0.5 h-0.5 border-b border-r border-neutral-950"></span>
              F
            </div>
            <span className="font-bold text-slate-900 font-mono tracking-widest text-xs uppercase">Fokus</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
          <ChatWindow />
        </main>
      </div>
    </div>
  );
}
