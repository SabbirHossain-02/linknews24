"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin-api";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  city?: string | null;
  joinedAt?: string;
}

interface AuthContextValue {
  user: AccountUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (patch: Partial<AccountUser>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    apiFetch<{ user: AccountUser }>("/api/account/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (email: string, password: string) => {
    const d = await apiFetch<{ user: AccountUser }>("/api/account/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(d.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const d = await apiFetch<{ user: AccountUser }>("/api/account/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setUser(d.user);
  };

  const updateUser = async (patch: Partial<AccountUser>) => {
    const d = await apiFetch<{ user: AccountUser }>("/api/account/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setUser(d.user);
  };

  const logout = () => {
    apiFetch("/api/account/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
