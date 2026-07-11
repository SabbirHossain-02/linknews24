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
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface NavItem {
  key: AdminKey;
  href: string | null;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "articles", href: "/admin/articles", icon: Newspaper },
  { key: "categoriesTags", href: "/admin/categories", icon: FolderTree },
  { key: "breaking", href: "/admin/breaking", icon: Radio },
  { key: "homepageBuilder", href: "/admin/homepage", icon: LayoutTemplate },
  { key: "liveTv", href: "/admin/live-tv", icon: Tv },
  { key: "media", href: "/admin/media", icon: ImageIcon },
  { key: "lawyers", href: "/admin/lawyers", icon: Scale },
  { key: "donors", href: "/admin/donors", icon: Droplet },
  { key: "newsletter", href: "/admin/newsletter", icon: Mail },
  { key: "comments", href: "/admin/comments", icon: MessageSquare },
  { key: "settings", href: "/admin/settings", icon: Settings },
  { key: "usersRoles", href: "/admin/users", icon: Users },
];

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
  const t = useAdminT();
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
          {NAV.map(({ key, href, icon: Icon }) => {
            const active = href && pathname === href;
            const cls =
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-sm transition-colors";
            if (!href) {
              return (
                <div key={key} className={`${cls} cursor-default text-white/35`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{t(key)}</span>
                  <span className="text-[9px] text-white/25">{t("comingSoon")}</span>
                </div>
              );
            }
            return (
              <Link
                key={key}
                href={href}
                onClick={() => setOpen(false)}
                className={`${cls} ${active ? "bg-brand-crimson text-white" : "text-white/80 hover:bg-white/10"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(key)}
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
            <button onClick={() => setOpen((v) => !v)} className="text-heading lg:hidden" aria-label={t("menu")}>
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
                {user ? t(`role${user.role}` as AdminKey) : ""}
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
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
