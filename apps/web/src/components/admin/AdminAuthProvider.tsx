"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket, reconnectSocket } from "@/lib/socket";

/** The admin modules the Super Admin hands out, and what each switch allows. */
export const MODULES = [
  "dashboard",
  "articles",
  "categories",
  "breaking",
  "homepage",
  "liveTv",
  "media",
  "epaper",
  "lawyers",
  "donors",
  "hospitals",
  "newsletter",
  "ads",
  "comments",
  "seo",
  "settings",
] as const;

export type Module = (typeof MODULES)[number];
export type PermAction = "view" | "edit" | "delete";
export interface Perm {
  view: boolean;
  edit: boolean;
  delete: boolean;
}
export type PermSet = Record<Module, Perm>;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  /** What this person may do, as the server enforces it right now. */
  permissions?: PermSet;
  /** Everyone but the Super Admin: their stories go for approval first. */
  needsApproval?: boolean;
}

interface AdminAuthValue {
  user: AdminUser | null;
  loading: boolean;
  isSuper: boolean;
  can: (module: Module, action?: PermAction) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: AdminUser }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // The Super Admin changing what this person may do, or switching them off,
  // reaches this panel at once — no reload, no waiting for the cookie to lapse.
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onPerms = () => refresh();
    const onRevoked = () => setUser(null);
    socket.on("permissions:changed", onPerms);
    socket.on("session:revoked", onRevoked);
    // Reconnecting after a dropped line: re-read, in case something changed
    // while the socket was away.
    socket.io.on("reconnect", onPerms);
    return () => {
      socket.off("permissions:changed", onPerms);
      socket.off("session:revoked", onRevoked);
      socket.io.off("reconnect", onPerms);
    };
  }, [user?.id, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ user: AdminUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    reconnectSocket();
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    reconnectSocket();
  };

  const isSuper = user?.role === "SUPER_ADMIN";
  const can = useCallback(
    (module: Module, action: PermAction = "view") =>
      isSuper || !!user?.permissions?.[module]?.[action],
    [isSuper, user?.permissions],
  );

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, isSuper, can, login, logout, refresh }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
