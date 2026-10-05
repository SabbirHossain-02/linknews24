"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardCheck,
  Droplet,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LayoutTemplate,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  Radio,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Tv,
  Users,
} from "lucide-react";
import { useAdminAuth, type Module } from "./AdminAuthProvider";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { NotificationBell } from "./NotificationBell";
import { useAdminText } from "@/lib/admin-strings";

interface NavItem {
  key: AdminKey;
  href: string | null;
  icon: typeof LayoutDashboard;
  /**
   * The permission module behind the page. Hidden from anyone the Super Admin
   * has not given "view" on it — and the API refuses them too.
   */
  module?: Module;
  /** Hidden from anyone who is not a Super Admin — the API refuses them too. */
  superOnly?: boolean;
}

const NAV: NavItem[] = [
  // Everyone has a dashboard: their own work, plus the site figures if allowed.
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "approvalsNav", href: "/admin/approvals", icon: ClipboardCheck, superOnly: true },
  { key: "teamNav", href: "/admin/team", icon: Activity, superOnly: true },
  { key: "articles", href: "/admin/articles", icon: Newspaper, module: "articles" },
  { key: "categoriesTags", href: "/admin/categories", icon: FolderTree, module: "categories" },
  { key: "breaking", href: "/admin/breaking", icon: Radio, module: "breaking" },
  { key: "homepageBuilder", href: "/admin/homepage", icon: LayoutTemplate, module: "homepage" },
  { key: "liveTv", href: "/admin/live-tv", icon: Tv, module: "liveTv" },
  { key: "media", href: "/admin/media", icon: ImageIcon, module: "media" },
  { key: "epaper", href: "/admin/epaper", icon: FileText, module: "epaper" },
  { key: "lawyers", href: "/admin/lawyers", icon: Scale, module: "lawyers" },
  { key: "donors", href: "/admin/donors", icon: Droplet, module: "donors" },
  { key: "hospitals", href: "/admin/hospitals", icon: Building2, module: "hospitals" },
  { key: "newsletter", href: "/admin/newsletter", icon: Mail, module: "newsletter" },
  { key: "ads", href: "/admin/ads", icon: Megaphone, module: "ads" },
  { key: "comments", href: "/admin/comments", icon: MessageSquare, module: "comments" },
  { key: "seo", href: "/admin/seo", icon: Search, module: "seo" },
  { key: "settings", href: "/admin/settings", icon: Settings },
  { key: "usersRoles", href: "/admin/users", icon: Users, superOnly: true },
  { key: "rolesNav", href: "/admin/roles", icon: ShieldCheck, superOnly: true },
];

/** The nav entry a path belongs to — /admin/articles/123/edit is Articles. */
function navFor(pathname: string): NavItem | undefined {
  return NAV.filter(
    (n) =>
      n.href &&
      (pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href + "/"))),
  ).sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0];
}

/**
 * Tells the server which admin page this tab is on, so the Super Admin's team
 * page can show who is working where. Sent again whenever the page changes and
 * whenever the server says the socket is ready (after every reconnect).
 */
function usePresence(pathname: string) {
  useEffect(() => {
    const socket = getSocket();
    const send = () => socket.emit("presence:page", { path: pathname });
    send();
    socket.on("staff:ready", send);
    return () => {
      socket.off("staff:ready", send);
    };
  }, [pathname]);
}

/**
 * Reader submissions waiting on each section, keyed by the nav entry they
 * belong to, so the sidebar can show a count without every page fetching it.
 *
 * Refreshed on the API's realtime `content:changed` signal — a submission made
 * while an editor is looking at the panel shows up without a reload — and on a
 * slow poll as a backstop for a dropped socket.
 */
function usePendingCounts(): Partial<Record<AdminKey, number>> {
  const [counts, setCounts] = useState<Partial<Record<AdminKey, number>>>({});

  useEffect(() => {
    const load = () =>
      apiFetch<{
        lawyers: number;
        donors: number;
        hospitals: number;
        comments: number;
        approvals: number;
      }>("/api/admin/pending-counts")
        .then((d) =>
          setCounts({
            lawyers: d.lawyers,
            donors: d.donors,
            hospitals: d.hospitals,
            comments: d.comments,
            approvalsNav: d.approvals,
          }),
        )
        .catch(() => {});

    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    socket.on("approvals:changed", load);
    const timer = setInterval(load, 60_000);
    return () => {
      socket.off("content:changed", load);
      socket.off("approvals:changed", load);
      clearInterval(timer);
    };
  }, []);

  return counts;
}

const FONT_KEY = "linknews24-font-scale";

function FontScale() {
  const ax = useAdminText();
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
        aria-label={ax("ফন্ট ছোট")}
      >
        {ax("অ−")}
      </button>
      <button
        onClick={() => adjust(0.1)}
        disabled={scale >= 1.3}
        className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm font-bold text-foreground hover:bg-surface disabled:opacity-30"
        aria-label={ax("ফন্ট বড়")}
      >
        {ax("অ+")}
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const ax = useAdminText();
  const { user, logout, isSuper, can } = useAdminAuth();
  const { locale, setLocale } = useLocale();
  const t = useAdminT();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pending = usePendingCounts();
  usePresence(pathname);

  const allowed = (n: NavItem) =>
    n.superOnly ? isSuper : n.module ? can(n.module, "view") : true;
  const current = navFor(pathname);
  const blocked = current ? !allowed(current) : false;

  // Name the browser tab after the section being viewed, in whichever language
  // the panel is set to. A row of admin tabs is otherwise indistinguishable.
  const section = NAV.find((n) => n.href === pathname);
  useEffect(() => {
    document.title = section
      ? `${t(section.key)} | LinkNews24 Admin`
      : "LinkNews24 Admin";
  }, [section, t, locale]);

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
        {/* The masthead is a dark-on-light lockup, so the whole header block is
            white rather than a small plate floating in the navy rail. */}
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-border bg-white px-5">
          <Image
            src="/logo.png"
            alt="LinkNews24"
            width={2048}
            height={656}
            priority
            className="h-11 w-auto"
          />
          <span className="font-ui text-[10px] uppercase tracking-widest text-foreground-muted">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.filter(allowed).map(
            ({ key, href, icon: Icon }) => {
            const active = href && current?.href === href;
            const waiting = pending[key] ?? 0;
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
                <span className="flex-1">{t(key)}</span>
                {/* How many reader submissions are waiting on this section. */}
                {waiting > 0 && (
                  <span
                    title={`${waiting}${ax("টি অনুমোদনের অপেক্ষায়")}`}
                    className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center font-ui text-[10px] font-bold ${
                      active ? "bg-white text-brand-crimson" : "bg-brand-crimson text-white"
                    }`}
                  >
                    {waiting}
                  </span>
                )}
              </Link>
            );
            },
          )}
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
              {locale === "bn" ? "English" : "বাংলা"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-semibold text-heading">{user?.name}</p>
              <p className="font-ui text-xs text-foreground-muted">
                {user ? t(`role${user.role}` as AdminKey) : ""}
              </p>
            </div>
            {/* The uploaded picture when there is one; the initial otherwise. */}
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-crimson font-ui text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground-muted transition-colors hover:text-brand-crimson"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          {blocked ? (
            // The server refuses these requests anyway; this says so plainly
            // instead of showing a page of failed loads.
            <div className="mx-auto mt-16 max-w-md rounded-2xl border border-border bg-background p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-crimson/10 text-brand-crimson">
                <Lock className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-lg font-bold text-heading">
                {ax("এই পাতা দেখার অনুমতি নেই")}
              </h1>
              <p className="mt-2 font-ui text-sm leading-relaxed text-foreground-muted">
                {ax("সুপার অ্যাডমিন আপনাকে এই অংশের অনুমতি দেননি। দরকার হলে তাঁর সঙ্গে যোগাযোগ করুন।")}
              </p>
              <Link
                href="/admin"
                className="mt-5 inline-block rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
              >
                {ax("ড্যাশবোর্ডে ফিরুন")}
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
