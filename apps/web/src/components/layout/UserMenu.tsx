"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!ready) return <div className="h-3.5 w-10" aria-hidden />;
  if (!user) return <AuthModal />;

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 transition-colors hover:text-white"
      >
        {user.name}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-background py-1.5 text-foreground shadow-lg">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 font-ui text-sm transition-colors hover:bg-surface"
          >
            ড্যাশবোর্ড
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full px-3.5 py-2 text-left font-ui text-sm text-brand-crimson transition-colors hover:bg-surface"
          >
            লগআউট
          </button>
        </div>
      )}
    </div>
  );
}
