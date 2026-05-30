"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "superuser" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
  joinedAt: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (googleUser: User) => void;
  logout: () => void;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeRole: (id: string, role: Role) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem("fokus_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    // Ambil daftar users dari backend jika login (bisa dibatasi hanya Admin, tapi kita muat saja)
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data || []))
      .catch(e => console.error(e));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("fokus_user", JSON.stringify(data.user));
        return { success: true, message: "Login berhasil" };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, address?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("fokus_user", JSON.stringify(data.user));
        return { success: true, message: "Registrasi berhasil" };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fokus_user");
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
        const updatedItem = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? updatedItem : u));
        if (user?.id === id) {
          const newUser = { ...user, ...data };
          setUser(newUser);
          localStorage.setItem("fokus_user", JSON.stringify(newUser));
        }
    }
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
      if (user?.id === id) logout();
    }
  };

  const changeRole = async (id: string, role: Role) => {
    await updateUser(id, { role });
  };

  const loginWithGoogle = (googleUser: User) => {
    setUser(googleUser);
    localStorage.setItem("fokus_user", JSON.stringify(googleUser));
    setUsers(prev => {
      if (prev.some(u => u.id === googleUser.id)) {
        return prev.map(u => u.id === googleUser.id ? googleUser : u);
      }
      return [...prev, googleUser];
    });
  };

  const noop = async () => ({ success: false, message: "" });

  return (
    <AuthContext.Provider value={{
      user: mounted ? user : null,
      users: mounted ? users : [],
      login: mounted ? login : noop,
      register: mounted ? register : noop,
      loginWithGoogle: mounted ? loginWithGoogle : () => {},
      logout: mounted ? logout : () => {},
      updateUser: mounted ? updateUser : async () => {},
      deleteUser: mounted ? deleteUser : async () => {},
      changeRole: mounted ? changeRole : async () => {},
      isAuthenticated: mounted ? !!user : false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
