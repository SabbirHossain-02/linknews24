"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Droplet,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  Radio,
  Scale,
  Settings,
  Tv,
  Users,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";

interface NavItem {
  label: string;
  href: string | null; // null = not built yet
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { label: "আর্টিকেল", href: "/admin/articles", icon: Newspaper },
  { label: "ক্যাটাগরি ও ট্যাগ", href: null, icon: FolderTree },
  { label: "ব্রেকিং নিউজ", href: null, icon: Radio },
  { label: "হোমপেজ বিল্ডার", href: null, icon: LayoutTemplate },
  { label: "লাইভ টিভি", href: null, icon: Tv },
  { label: "মিডিয়া", href: null, icon: ImageIcon },
  { label: "আইনজীবী", href: null, icon: Scale },
  { label: "রক্তদাতা", href: null, icon: Droplet },
  { label: "নিউজলেটার", href: null, icon: Mail },
  { label: "কমেন্ট", href: null, icon: MessageSquare },
  { label: "সেটিংস", href: null, icon: Settings },
  { label: "ইউজার ও রোল", href: null, icon: Users },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "সুপার অ্যাডমিন",
  ADMIN: "অ্যাডমিন",
  EDITOR: "এডিটর",
  REPORTER: "রিপোর্টার",
  MODERATOR: "মডারেটর",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-brand-navy text-white/90 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-5">
          <span className="text-lg font-bold tracking-tight text-white">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <span className="font-ui text-[10px] uppercase tracking-widest text-white/40">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href && pathname === href;
            const cls =
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-sm transition-colors";
            if (!href) {
              return (
                <div
                  key={label}
                  className={`${cls} cursor-default text-white/35`}
                  title="শীঘ্রই আসছে"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[9px] text-white/25">শীঘ্রই</span>
                </div>
              );
            }
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={`${cls} ${
                  active
                    ? "bg-brand-crimson text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-5">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-heading lg:hidden"
            aria-label="মেনু"
          >
            ☰
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-heading">{user?.name}</p>
              <p className="font-ui text-xs text-foreground-muted">
                {user ? ROLE_LABEL[user.role] ?? user.role : ""}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-crimson font-ui text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground-muted transition-colors hover:text-brand-crimson"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
