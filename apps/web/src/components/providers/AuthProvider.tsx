"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  clearUser,
  getStoredUser,
  storeUser,
  type MockUser,
} from "@/lib/auth-storage";

interface AuthContextValue {
  user: MockUser | null;
  ready: boolean;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  updateUser: (patch: Partial<MockUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = (email: string) => {
    const nameFromEmail = email.split("@")[0];
    const nextUser: MockUser = {
      ...getStoredUser(),
      name: nameFromEmail,
      email,
      joinedAt: getStoredUser()?.joinedAt ?? new Date().toISOString(),
    };
    storeUser(nextUser);
    setUser(nextUser);
  };

  const register = (name: string, email: string) => {
    const nextUser: MockUser = {
      name,
      email,
      joinedAt: getStoredUser()?.joinedAt ?? new Date().toISOString(),
    };
    storeUser(nextUser);
    setUser(nextUser);
  };

  const updateUser = (patch: Partial<MockUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      storeUser(next);
      return next;
    });
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, login, register, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
