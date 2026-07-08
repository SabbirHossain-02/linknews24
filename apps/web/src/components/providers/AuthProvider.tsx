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
    const nextUser = { name: nameFromEmail, email };
    storeUser(nextUser);
    setUser(nextUser);
  };

  const register = (name: string, email: string) => {
    const nextUser = { name, email };
    storeUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
