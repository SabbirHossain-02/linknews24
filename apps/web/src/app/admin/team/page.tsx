"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Hourglass,
  KeyRound,
  PenLine,
  Users,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { UserPermissionsModal } from "@/components/admin/UserPermissionsModal";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";
import { adminPageLabel } from "@/lib/admin-pages";

interface PageVisit {
  path: string;
  articleId?: string;
  articleTitle?: string;
  since: string;
}

interface OnlineUser {
  userId: string;
  name: string;
  role: string;
  since: string;
  pages: PageVisit[];
}

interface Stats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
  drafts: number;
  revisionsPending: number;
  today: number;
  week: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  active: boolean;
  lastSeenAt: string | null;
  online: boolean;
  lastActivity: { action: string; detail: string | null; createdAt: string } | null;
  stats: Stats;
}

interface ActivityRow {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
  user: { id: string; name: string; role: string } | null;
}

interface Team {
  online: OnlineUser[];
  members: Member[];
  activity: ActivityRow[];
}

/** The API's section names, for "changed something in …" lines. */
const SECTIONS: Record<string, AdminKey> = {
  categories: "categoriesTags",
  breaking: "breaking",
  homepage: "homepageBuilder",
  "section-articles": "homepageBuilder",
  livetv: "liveTv",
  epaper: "epaper",
  lawyers: "lawyers",
  donors: "donors",
  hospitals: "hospitals",
  listings: "lawyers",
  subscribers: "newsletter",
  ads: "ads",
  comments: "comments",
  seo: "seo",
  settings: "settings",
};

const ACTIONS: Record<string, { label: string; tone: "green" | "red" | "amber" | "navy" | "muted" }> = {
  article_created: { label: "খসড়া খবর তৈরি করেছেন", tone: "navy" },
  article_submitted: { label: "অনুমোদনের জন্য খবর পাঠিয়েছেন", tone: "amber" },
  article_updated: { label: "খবর সম্পাদনা করেছেন", tone: "navy" },
  revision_submitted: { label: "প্রকাশিত খবরে সংশোধন পাঠিয়েছেন", tone: "amber" },
  article_approved: { label: "খবর অনুমোদন দিয়েছেন", tone: "green" },
  article_published: { label: "খবর প্রকাশ করেছেন", tone: "green" },
  article_unpublished: { label: "খবর সরিয়ে নিয়েছেন", tone: "muted" },
  article_rejected: { label: "খবর বাতিল করেছেন", tone: "red" },
  article_drafted: { label: "খবর খসড়ায় ফেরত পাঠিয়েছেন", tone: "muted" },
  article_deleted: { label: "খবর মুছেছেন", tone: "red" },
  revision_approved: { label: "সংশোধন অনুমোদন দিয়েছেন", tone: "green" },
  revision_rejected: { label: "সংশোধন বাতিল করেছেন", tone: "red" },
  module_edit: { label: "পরিবর্তন করেছেন", tone: "navy" },
  module_delete: { label: "মুছেছেন", tone: "red" },
  login: { label: "লগইন করেছেন", tone: "muted" },
  logout: { label: "লগআউট করেছেন", tone: "muted" },
  permissions_changed: { label: "অনুমতি বদলেছেন", tone: "amber" },
  permissions_reset: { label: "রোলের অনুমতি ডিফল্টে ফিরিয়েছেন", tone: "amber" },
  user_created: { label: "নতুন ইউজার যোগ করেছেন", tone: "navy" },
  user_role_changed: { label: "ইউজারের রোল বদলেছেন", tone: "amber" },
  user_deactivated: { label: "ইউজার নিষ্ক্রিয় করেছেন", tone: "red" },
  user_deleted: { label: "ইউজার মুছেছেন", tone: "red" },
  password_changed: { label: "পাসওয়ার্ড বদলেছেন", tone: "muted" },
  email_changed: { label: "ইমেইল বদলেছেন", tone: "muted" },
};

const TONE_CLS = {
  green: "bg-green-500",
  red: "bg-brand-crimson",
  amber: "bg-amber-500",
  navy: "bg-brand-navy",
  muted: "bg-foreground-muted/40",
};

function since(iso: string | null | undefined, ax: (s: string) => string, now: number) {
  if (!iso) return ax("কখনো আসেননি");
  const sec = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (sec < 60) return ax("এইমাত্র");
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ${ax("মিনিট আগে")}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${ax("ঘণ্টা আগে")}`;
  return `${Math.floor(hr / 24)} ${ax("দিন আগে")}`;
}

/** "12 min" — how long someone has been online, or on the page they are on. */
function forHowLong(iso: string, ax: (s: string) => string, now: number) {
  const min = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return ax("এইমাত্র");
  if (min < 60) return `${min} ${ax("মিনিট")}`;
  return `${Math.floor(min / 60)} ${ax("ঘণ্টা")} ${min % 60} ${ax("মিনিট")}`;
}

function Avatar({ name, src, online, size = 40 }: { name: string; src?: string | null; online?: boolean; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-navy font-ui text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
            online ? "bg-green-500" : "bg-foreground-muted/30"
          }`}
        />
      )}
    </span>
  );
}

/**
 * The Super Admin's view of the newsroom: who has the panel open and on which
 * page, how much each person has filed, and a running log of what was done.
 * Presence moves live over the socket; the figures refresh whenever content
 * or the approval queue changes.
 */
export default function TeamPage() {
  const t = useAdminT();
  const ax = useAdminText();
  const { isSuper } = useAdminAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [permsFor, setPermsFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    () =>
      apiFetch<Team>("/api/admin/team")
        .then((d) => {
          setTeam(d);
          setOnline(d.online);
        })
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    if (!isSuper) return;
    load();
    const socket = getSocket();
    const onPresence = (p: { online: OnlineUser[] }) => setOnline(p.online);
    // A burst of saves becomes one reload.
    const soon = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(load, 800);
    };
    socket.on("presence:update", onPresence);
    socket.on("approvals:changed", soon);
    socket.on("content:changed", soon);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      socket.off("presence:update", onPresence);
      socket.off("approvals:changed", soon);
      socket.off("content:changed", soon);
      clearInterval(tick);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [isSuper, load]);

  const onlineIds = useMemo(() => new Set(online.map((o) => o.userId)), [online]);

  const pageLabel = (v: PageVisit) => adminPageLabel(v, t, ax);

  const actionText = (a: { action: string; entity?: string | null; detail?: string | null }) => {
    const known = ACTIONS[a.action];
    if (a.action === "module_edit" || a.action === "module_delete") {
      const where = a.entity && SECTIONS[a.entity] ? t(SECTIONS[a.entity]) : a.entity ?? "";
      return `${where} — ${ax(known.label)}`;
    }
    return known ? ax(known.label) : a.action;
  };

  if (!isSuper)
    return <p className="font-ui text-sm text-foreground-muted">{t("rolesDenied")}</p>;
  if (!team)
    return (
      <p className="font-ui text-sm text-foreground-muted">{error ?? t("loading")}</p>
    );

  const staff = team.members.filter((m) => m.active);
  const sum = (k: keyof Stats) => staff.reduce((n, m) => n + m.stats[k], 0);
  const waiting = sum("pending") + sum("revisionsPending");

  const tiles = [
    { icon: Users, label: "এখন অনলাইনে", value: online.length, tone: "text-green-600 bg-green-50" },
    { icon: PenLine, label: "আজ লেখা খবর", value: sum("today"), tone: "text-brand-navy bg-brand-navy/10" },
    { icon: CalendarDays, label: "গত ৭ দিনে", value: sum("week"), tone: "text-brand-navy bg-brand-navy/10" },
    { icon: Hourglass, label: "অনুমোদনের অপেক্ষায়", value: waiting, tone: "text-amber-600 bg-amber-50", href: "/admin/approvals" },
  ];

  return (
    <div className="max-w-6xl pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-heading">
            <Activity className="h-6 w-6 text-brand-crimson" />
            {t("teamNav")}
          </h1>
          <p className="mt-1 font-ui text-sm text-foreground-muted">
            {ax("কে এখন প্যানেলে আছেন, কোন পাতায় কাজ করছেন, আর কে কতটি খবর দিয়েছেন।")}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-ui text-xs font-semibold text-green-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          {ax("লাইভ আপডেট")}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value, tone, href }) => {
          const body = (
            <>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-ui text-2xl font-bold text-heading">{value}</span>
                <span className="block font-ui text-xs text-foreground-muted">{ax(label)}</span>
              </span>
            </>
          );
          const cls = "flex items-center gap-3 rounded-2xl border border-border bg-background p-4";
          return href ? (
            <Link key={label} href={href} className={`${cls} transition-colors hover:border-brand-crimson/40`}>
              {body}
            </Link>
          ) : (
            <div key={label} className={cls}>
              {body}
            </div>
          );
        })}
      </div>

      {/* Who is in the panel right now */}
      <h2 className="mt-8 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
        {ax("এখন অনলাইনে")} ({online.length})
      </h2>
      {online.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center font-ui text-sm text-foreground-muted">
          {ax("এই মুহূর্তে কেউ প্যানেলে নেই")}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {online.map((o) => {
            const m = team.members.find((x) => x.id === o.userId);
            return (
              <div key={o.userId} className="rounded-2xl border border-green-200 bg-background p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={o.name} src={m?.avatar} online />
                  <div className="min-w-0 flex-1">
                    <p className="font-ui text-sm font-semibold text-heading">{o.name}</p>
                    <p className="font-ui text-xs text-foreground-muted">
                      {t(`role${o.role}` as AdminKey)} · {ax("অনলাইনে")}: {forHowLong(o.since, ax, now)}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {o.pages.length === 0 ? (
                    <li className="font-ui text-xs text-foreground-muted">{ax("প্যানেল খুলছেন…")}</li>
                  ) : (
                    o.pages.map((v, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 font-ui text-xs"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-green-500" />
                        <span className="min-w-0 flex-1">
                          {v.articleId ? (
                            <Link
                              href={`/admin/articles/${v.articleId}/edit`}
                              className="font-semibold text-foreground hover:text-brand-crimson"
                            >
                              {pageLabel(v)}
                            </Link>
                          ) : (
                            <span className="font-semibold text-foreground">{pageLabel(v)}</span>
                          )}
                          <span className="block text-foreground-muted">{ax("এই পাতায়")}: {forHowLong(v.since, ax, now)}</span>
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* What each person has filed */}
      <h2 className="mt-8 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
        {ax("কে কতটি খবর দিয়েছেন")}
      </h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-surface/60 font-ui text-[11px] uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3">{ax("সদস্য")}</th>
              <th className="px-2 py-3 text-center">{ax("আজ")}</th>
              <th className="px-2 py-3 text-center">{ax("৭ দিনে")}</th>
              <th className="px-2 py-3 text-center">{ax("মোট")}</th>
              <th className="px-2 py-3 text-center">{ax("প্রকাশিত")}</th>
              <th className="px-2 py-3 text-center">{ax("অপেক্ষায়")}</th>
              <th className="px-2 py-3 text-center">{ax("বাতিল হয়েছে")}</th>
              <th className="px-4 py-3">{ax("শেষ কাজ")}</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {team.members.map((m) => {
              const isOnline = onlineIds.has(m.id);
              return (
                <tr key={m.id} className={m.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={m.name} src={m.avatar} online={isOnline} size={34} />
                      <div className="min-w-0">
                        <p className="font-semibold text-heading">{m.name}</p>
                        <p className="font-ui text-[11px] text-foreground-muted">
                          {t(`role${m.role}` as AdminKey)} ·{" "}
                          {isOnline ? (
                            <span className="font-semibold text-green-600">{ax("অনলাইনে")}</span>
                          ) : (
                            since(m.lastSeenAt, ax, now)
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <Num v={m.stats.today} strong />
                  <Num v={m.stats.week} />
                  <Num v={m.stats.total} />
                  <Num v={m.stats.published} tone="text-green-700" />
                  <Num v={m.stats.pending + m.stats.revisionsPending} tone="text-amber-600" />
                  <Num v={m.stats.rejected} tone="text-brand-crimson" />
                  <td className="max-w-[220px] px-4 py-3">
                    {m.lastActivity ? (
                      <>
                        <p className="truncate font-ui text-xs text-foreground">
                          {actionText(m.lastActivity)}
                          {m.lastActivity.detail && m.lastActivity.action.startsWith("article")
                            ? ` — ${m.lastActivity.detail}`
                            : ""}
                        </p>
                        <p className="font-ui text-[11px] text-foreground-muted">
                          {since(m.lastActivity.createdAt, ax, now)}
                        </p>
                      </>
                    ) : (
                      <span className="font-ui text-xs text-foreground-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {m.role !== "SUPER_ADMIN" && (
                      <button
                        type="button"
                        onClick={() => setPermsFor(m.id)}
                        title={ax("অনুমতি")}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Running log */}
      <h2 className="mt-8 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
        {ax("সাম্প্রতিক কার্যকলাপ")}
      </h2>
      <ol className="mt-3 overflow-hidden rounded-2xl border border-border bg-background">
        {team.activity.length === 0 ? (
          <li className="px-4 py-8 text-center font-ui text-sm text-foreground-muted">
            {ax("এখনো কোনো কার্যকলাপ নেই")}
          </li>
        ) : (
          team.activity.map((a) => {
            const tone = ACTIONS[a.action]?.tone ?? "muted";
            const Icon =
              tone === "green" ? CheckCircle2 : tone === "red" ? XCircle : tone === "amber" ? Clock : FileText;
            return (
              <li key={a.id} className="flex items-start gap-3 border-b border-border px-4 py-2.5 last:border-0">
                <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${TONE_CLS[tone]}`}>
                  <Icon className="h-3 w-3" />
                </span>
                <p className="min-w-0 flex-1 font-ui text-[13px] text-foreground">
                  <b>{a.user?.name ?? ax("অজানা")}</b> {actionText(a)}
                  {a.detail && a.entity === "article" && (
                    <>
                      {" — "}
                      {a.entityId ? (
                        <Link href={`/admin/articles/${a.entityId}/edit`} className="text-brand-crimson hover:underline">
                          {a.detail}
                        </Link>
                      ) : (
                        a.detail
                      )}
                    </>
                  )}
                </p>
                <span className="shrink-0 font-ui text-[11px] text-foreground-muted">
                  {since(a.createdAt, ax, now)}
                </span>
              </li>
            );
          })
        )}
      </ol>

      {permsFor && (
        <UserPermissionsModal userId={permsFor} onClose={() => setPermsFor(null)} />
      )}
    </div>
  );
}

function Num({ v, tone, strong }: { v: number; tone?: string; strong?: boolean }) {
  return (
    <td
      className={`px-2 py-3 text-center font-ui ${strong ? "text-base font-bold" : "text-sm font-semibold"} ${
        v === 0 ? "text-foreground-muted/50" : tone ?? "text-heading"
      }`}
    >
      {v}
    </td>
  );
}
