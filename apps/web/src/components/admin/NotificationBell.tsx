"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Droplet,
  GitCompare,
  Megaphone,
  MessageSquare,
  Scale,
  XCircle,
} from "lucide-react";
import { useAdminText } from "@/lib/admin-strings";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

type Kind = "lawyer" | "donor" | "hospital" | "comment" | "ad" | "article" | "revision";

interface Item {
  id: string;
  kind: Kind;
  subject: string;
  href: string;
  createdAt: string;
}

interface Payload {
  items: Item[];
  counts: Record<Kind, number>;
  total: number;
}

const ICONS: Record<Kind, typeof Bell> = {
  lawyer: Scale,
  donor: Droplet,
  hospital: Building2,
  comment: MessageSquare,
  ad: Megaphone,
  article: ClipboardCheck,
  revision: GitCompare,
};

/** A message for this person alone — the Super Admin's decision on their story. */
interface Personal {
  id: string;
  kind: string;
  title: string;
  message: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

const PERSONAL: Record<string, { label: string; icon: typeof Bell; cls: string }> = {
  article_approved: { label: "আপনার খবর অনুমোদিত ও প্রকাশিত হয়েছে", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
  revision_approved: { label: "আপনার সংশোধন অনুমোদিত হয়েছে", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
  article_rejected: { label: "আপনার খবর বাতিল করা হয়েছে", icon: XCircle, cls: "bg-brand-crimson/10 text-brand-crimson" },
  revision_rejected: { label: "আপনার সংশোধন বাতিল করা হয়েছে", icon: XCircle, cls: "bg-brand-crimson/10 text-brand-crimson" },
  article_drafted: { label: "আপনার খবর খসড়ায় ফেরত পাঠানো হয়েছে", icon: Archive, cls: "bg-surface text-foreground-muted" },
};

/** When the bell was last opened — anything newer than this is "new". */
const SEEN_KEY = "ln24-admin-notifications-seen";

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function ago(iso: string, t: (k: AdminKey, v?: Record<string, string>) => string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return t("notifJustNow");
  if (min < 60) return t("notifMinutes", { n: String(min) });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t("notifHours", { n: String(hr) });
  return t("notifDays", { n: String(Math.floor(hr / 24)) });
}

/**
 * The notification bell.
 *
 * It carries what is genuinely waiting for a decision — reader submissions to
 * the legal, blood and hospital directories, comments held for moderation, and
 * ad bookings — read live from those tables. So a notification disappears the
 * moment the thing behind it is dealt with, and the badge cannot lie about
 * work that no longer exists.
 *
 * The badge counts what has arrived since the bell was last opened; the panel
 * still lists everything outstanding, because a submission you have seen but
 * not approved is still your job.
 */
export function NotificationBell() {
  const t = useAdminT();
  const ax = useAdminText();
  const [data, setData] = useState<Payload | null>(null);
  const [mine, setMine] = useState<{ items: Personal[]; unread: number }>({ items: [], unread: 0 });
  const [pop, setPop] = useState<Personal | null>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    apiFetch<Payload>("/api/admin/notifications")
      .then(setData)
      .catch(() => {});
    apiFetch<{ items: Personal[]; unread: number }>("/api/admin/my/notifications")
      .then(setMine)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSeen(readSeen());
    load();
    // A reader submitting something reaches the bell without a reload.
    const socket = getSocket();
    // The Super Admin's decision arrives the moment it is made, with a
    // short pop-up so it is not missed.
    const onPersonal = (n: Personal) => {
      setMine((m) => ({ items: [n, ...m.items].slice(0, 30), unread: m.unread + 1 }));
      setPop(n);
    };
    socket.on("content:changed", load);
    socket.on("approvals:changed", load);
    socket.on("ads:booked", load);
    socket.on("notification:new", onPersonal);
    const timer = setInterval(load, 60_000);
    return () => {
      socket.off("content:changed", load);
      socket.off("approvals:changed", load);
      socket.off("ads:booked", load);
      socket.off("notification:new", onPersonal);
      clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!pop) return;
    const id = setTimeout(() => setPop(null), 7000);
    return () => clearTimeout(id);
  }, [pop]);

  const markRead = (ids?: string[]) => {
    setMine((m) => ({
      items: m.items.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)),
      unread: ids ? Math.max(0, m.unread - ids.length) : 0,
    }));
    apiFetch("/api/admin/my/notifications/read", {
      method: "POST",
      body: JSON.stringify(ids ? { ids } : {}),
    }).catch(() => {});
  };

  // Click outside or Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = data?.items ?? [];
  const fresh =
    items.filter((i) => new Date(i.createdAt).getTime() > seen).length + mine.unread;

  const toggle = () => {
    setOpen((v) => {
      // Opening it counts as having seen what is there now.
      if (!v) {
        const now = Date.now();
        try {
          localStorage.setItem(SEEN_KEY, String(now));
        } catch {
          /* private mode — the badge simply returns next reload */
        }
        setSeen(now);
        load();
      }
      return !v;
    });
  };

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t("notifications")}
        title={t("notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {fresh > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand-crimson px-1 font-ui text-[10px] font-bold leading-[18px] text-white">
            {fresh > 99 ? "99+" : fresh}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-border bg-background shadow-[0_12px_40px_rgba(20,24,31,0.18)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-ui text-sm font-semibold text-heading">
              {t("notifications")}
            </span>
            {data && data.total > 0 && (
              <span className="font-ui text-xs text-foreground-muted">
                {t("notifPending", { n: String(data.total) })}
              </span>
            )}
          </div>

          {mine.items.length > 0 && (
            <div className="border-b border-border">
              <div className="flex items-center justify-between bg-surface/60 px-4 py-1.5">
                <span className="font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
                  {ax("আপনার জন্য")}
                </span>
                {mine.unread > 0 && (
                  <button
                    type="button"
                    onClick={() => markRead()}
                    className="font-ui text-[11px] font-semibold text-brand-crimson hover:underline"
                  >
                    {ax("সব পড়া হয়েছে")}
                  </button>
                )}
              </div>
              <ul className="max-h-[240px] divide-y divide-border overflow-y-auto">
                {mine.items.slice(0, 10).map((n) => {
                  const meta = PERSONAL[n.kind];
                  const Icon = meta?.icon ?? Bell;
                  return (
                    <li key={n.id} className={n.read ? "" : "bg-brand-crimson/[0.04]"}>
                      <Link
                        href={n.href ?? "/admin/articles"}
                        onClick={() => {
                          if (!n.read) markRead([n.id]);
                          setOpen(false);
                        }}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface"
                      >
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta?.cls ?? "bg-surface"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-ui text-[13px] font-semibold text-foreground">
                            {meta ? ax(meta.label) : n.kind}
                          </span>
                          <span className="mt-0.5 block truncate font-ui text-xs text-foreground-muted">
                            {n.title}
                          </span>
                          {n.message && (
                            <span className="mt-1 block rounded bg-surface px-2 py-1 font-ui text-xs text-foreground">
                              “{n.message}”
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 font-ui text-[11px] text-foreground-muted/70">
                          {ago(n.createdAt, t)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {items.length === 0 ? (
            mine.items.length === 0 && (
              <p className="px-4 py-8 text-center font-ui text-sm text-foreground-muted">
                {t("notifEmpty")}
              </p>
            )
          ) : (
            <ul className="max-h-[380px] divide-y divide-border overflow-y-auto">
              {items.map((i) => {
                const Icon = ICONS[i.kind];
                return (
                  <li key={i.id}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-crimson/10 text-brand-crimson">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-ui text-[13px] text-foreground">
                          {t(`notif_${i.kind}` as AdminKey)}
                        </span>
                        <span className="mt-0.5 block truncate font-ui text-xs text-foreground-muted">
                          {i.subject}
                        </span>
                      </span>
                      <span className="shrink-0 font-ui text-[11px] text-foreground-muted/70">
                        {ago(i.createdAt, t)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {pop && (
        <Link
          href={pop.href ?? "/admin/articles"}
          onClick={() => {
            markRead([pop.id]);
            setPop(null);
          }}
          className="fixed right-5 top-20 z-[130] flex w-[320px] items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-[0_12px_40px_rgba(20,24,31,0.22)]"
        >
          {(() => {
            const meta = PERSONAL[pop.kind];
            const Icon = meta?.icon ?? Bell;
            return (
              <>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta?.cls ?? "bg-surface"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-ui text-sm font-semibold text-heading">
                    {meta ? ax(meta.label) : pop.kind}
                  </span>
                  <span className="mt-0.5 block truncate font-ui text-xs text-foreground-muted">{pop.title}</span>
                  {pop.message && (
                    <span className="mt-1 block font-ui text-xs text-foreground">“{pop.message}”</span>
                  )}
                </span>
              </>
            );
          })()}
        </Link>
      )}
    </div>
  );
}
