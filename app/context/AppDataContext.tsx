"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  category: string;   // Kamera | Lensa | Lighting | Aksesori
  brand: string;
  description: string;
  specs?: string;
  pricePerDay: number;  // IDR
  stock: number;
  available: number;
  tag?: string;         // Populer | Premium | Baru | ""
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Studio {
  id: string;
  name: string;
  description: string;
  pricePerHour: number; // IDR
  capacity: number;
  facilities: string[]; // list of facility strings
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;   // Wedding | Prewedding | Product | Fashion | Event | Portrait
  description: string;
  priceStart: number; // IDR
  duration?: string;  // e.g. "4-6 jam"
  includes: string[]; // list of included items
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  title: string;
  category: string;   // Wedding | Product | Fashion | Portrait | Event
  image: string;      // Image URL/path
  description?: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  equipment: Equipment;
  quantity: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppDataContextType {
  // Equipment
  equipment: Equipment[];
  refreshEquipment: () => Promise<void>;
  addEquipment: (item: Omit<Equipment, "id" | "createdAt">) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  // Studios
  studios: Studio[];
  addStudio: (item: Omit<Studio, "id" | "createdAt">) => Promise<void>;
  updateStudio: (id: string, data: Partial<Studio>) => Promise<void>;
  deleteStudio: (id: string) => Promise<void>;

  // Services
  services: Service[];
  addService: (item: Omit<Service, "id" | "createdAt">) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Portfolio / Galeri
  portfolio: Portfolio[];
  addPortfolio: (item: Omit<Portfolio, "id" | "createdAt">) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (eq: Equipment) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eqRes, stRes, svRes, ptRes] = await Promise.all([
          fetch("/api/equipment"),
          fetch("/api/studios"),
          fetch("/api/services"),
          fetch("/api/portfolio"),
        ]);
        if (eqRes.ok) setEquipment(await eqRes.json());
        if (stRes.ok) setStudios(await stRes.json());
        if (svRes.ok) setServices(await svRes.json());
        if (ptRes.ok) setPortfolio(await ptRes.json());
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setMounted(true);
      }
    }
    fetchData();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("fokus_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart:", e);
      }
    }
  }, []);

  const refreshEquipment = async () => {
    try {
      const res = await fetch("/api/equipment");
      if (res.ok) setEquipment(await res.json());
    } catch (e) {
      console.error("Failed to refresh equipment stock:", e);
    }
  };

  // Sync helper
  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("fokus_cart", JSON.stringify(newCart));
  };

  const addToCart = (eq: Equipment) => {
    const existing = cart.find(item => item.equipment.id === eq.id);
    if (existing) {
      if (existing.quantity >= eq.available) return;
      const updated = cart.map(item =>
        item.equipment.id === eq.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCartToStorage(updated);
    } else {
      const updated = [...cart, { equipment: eq, quantity: 1 }];
      saveCartToStorage(updated);
    }
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter(item => item.equipment.id !== id);
    saveCartToStorage(updated);
  };

  const updateCartQty = (id: string, qty: number) => {
    const targetItem = cart.find(item => item.equipment.id === id);
    if (!targetItem) return;
    const targetQty = Math.max(1, Math.min(qty, targetItem.equipment.available));
    const updated = cart.map(item =>
      item.equipment.id === id ? { ...item, quantity: targetQty } : item
    );
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  // ── Equipment ──
  const addEquipment = async (item: Omit<Equipment, "id" | "createdAt">) => {
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setEquipment(prev => [created, ...prev]);
    }
  };

  const updateEquipment = async (id: string, data: Partial<Equipment>) => {
    const res = await fetch(`/api/equipment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedItem = await res.json();
      setEquipment(prev => prev.map(e => e.id === id ? updatedItem : e));
    }
  };

  const deleteEquipment = async (id: string) => {
    const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEquipment(prev => prev.filter(e => e.id !== id));
    }
  };

  // ── Studios ──
  const addStudio = async (item: Omit<Studio, "id" | "createdAt">) => {
    const res = await fetch("/api/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setStudios(prev => [created, ...prev]);
    }
  };

  const updateStudio = async (id: string, data: Partial<Studio>) => {
    const res = await fetch(`/api/studios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedItem = await res.json();
      setStudios(prev => prev.map(s => s.id === id ? updatedItem : s));
    }
  };

  const deleteStudio = async (id: string) => {
    const res = await fetch(`/api/studios/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudios(prev => prev.filter(s => s.id !== id));
    }
  };

  // ── Services ──
  const addService = async (item: Omit<Service, "id" | "createdAt">) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setServices(prev => [created, ...prev]);
    }
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedItem = await res.json();
      setServices(prev => prev.map(s => s.id === id ? updatedItem : s));
    }
  };

  const deleteService = async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  // ── Portfolio ──
  const addPortfolio = async (item: Omit<Portfolio, "id" | "createdAt">) => {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setPortfolio(prev => [created, ...prev]);
    }
  };

  const updatePortfolio = async (id: string, data: Partial<Portfolio>) => {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedItem = await res.json();
      setPortfolio(prev => prev.map(p => p.id === id ? updatedItem : p));
    }
  };

  const deletePortfolio = async (id: string) => {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPortfolio(prev => prev.filter(p => p.id !== id));
    }
  };

  const value: AppDataContextType = mounted ? {
    equipment, refreshEquipment, addEquipment, updateEquipment, deleteEquipment,
    studios, addStudio, updateStudio, deleteStudio,
    services, addService, updateService, deleteService,
    portfolio, addPortfolio, updatePortfolio, deletePortfolio,
    cart, addToCart, removeFromCart, updateCartQty, clearCart,
  } : {
    equipment: [], refreshEquipment: async () => {}, addEquipment: async () => {}, updateEquipment: async () => {}, deleteEquipment: async () => {},
    studios: [], addStudio: async () => {}, updateStudio: async () => {}, deleteStudio: async () => {},
    services: [], addService: async () => {}, updateService: async () => {}, deleteService: async () => {},
    portfolio: [], addPortfolio: async () => {}, updatePortfolio: async () => {}, deletePortfolio: async () => {},
    cart: [], addToCart: () => {}, removeFromCart: () => {}, updateCartQty: () => {}, clearCart: () => {},
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
