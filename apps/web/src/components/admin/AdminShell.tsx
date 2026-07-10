"use client";

import { useEffect, useState } from "react";
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
  Menu,
  MessageSquare,
  Newspaper,
  Radio,
  Scale,
  Settings,
  Tv,
  Users,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

interface NavItem {
  label: string;
  href: string | null;
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

const FONT_KEY = "linknews24-font-scale";

function FontScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const s = Number(localStorage.getItem(FONT_KEY));
    if (s) setScale(s);
  }, []);
  const adjust = (d: number) => {
    const next = Math.min(1.3, Math.max(0.9, +(scale + d).toFixed(1)));
    setScale(next);
    document.documentElement.style.setProperty("--font-scale", String(next));
    localStorage.setItem(FONT_KEY, String(next));
  };
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => adjust(-0.1)}
        disabled={scale <= 0.9}
        className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs font-bold text-foreground hover:bg-surface disabled:opacity-30"
        aria-label="ফন্ট ছোট"
      >
        অ−
      </button>
      <button
        onClick={() => adjust(0.1)}
        disabled={scale >= 1.3}
        className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm font-bold text-foreground hover:bg-surface disabled:opacity-30"
        aria-label="ফন্ট বড়"
      >
        অ+
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar — fixed full height */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-brand-navy text-white/90 transition-transform lg:translate-x-0 ${
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
                <div key={label} className={`${cls} cursor-default text-white/35`} title="শীঘ্রই আসছে">
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
                className={`${cls} ${active ? "bg-brand-crimson text-white" : "text-white/80 hover:bg-white/10"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Content area */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen((v) => !v)} className="text-heading lg:hidden" aria-label="মেনু">
              <Menu className="h-6 w-6" />
            </button>
            <FontScale />
            <button
              onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
              className="rounded border border-border px-2.5 py-1 font-ui text-xs font-semibold text-foreground hover:bg-surface"
            >
              {locale === "bn" ? "EN" : "বাং"}
            </button>
          </div>
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

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
