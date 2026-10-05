"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Hourglass,
  PenLine,
  Plus,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminAuth } from "./AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";
import { adminPageLabel } from "@/lib/admin-pages";

interface OnlineUser {
  userId: string;
  name: string;
  role: string;
  pages: { path: string; articleId?: string; articleTitle?: string }[];
}

interface TeamSummary {
  online: OnlineUser[];
  members: {
    id: string;
    active: boolean;
    stats: { pending: number; revisionsPending: number; today: number };
  }[];
}

/**
 * The top of the Super Admin's dashboard: what is waiting for approval and
 * who is in the panel right now, with a way into each.
 */
export function NewsroomSummary() {
  const t = useAdminT();
  const ax = useAdminText();
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [online, setOnline] = useState<OnlineUser[]>([]);

  const load = useCallback(
    () =>
      apiFetch<TeamSummary>("/api/admin/team")
        .then((d) => {
          setTeam(d);
          setOnline(d.online);
        })
        .catch(() => {}),
    [],
  );

  useEffect(() => {
    load();
    const socket = getSocket();
    const onPresence = (p: { online: OnlineUser[] }) => setOnline(p.online);
    socket.on("presence:update", onPresence);
    socket.on("approvals:changed", load);
    return () => {
      socket.off("presence:update", onPresence);
      socket.off("approvals:changed", load);
    };
  }, [load]);

  if (!team) return null;
  const waiting = team.members.reduce(
    (n, m) => n + m.stats.pending + m.stats.revisionsPending,
    0,
  );
  const today = team.members.reduce((n, m) => n + m.stats.today, 0);

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <Link
        href="/admin/approvals"
        className={`group flex items-center gap-4 rounded-2xl border p-5 transition-colors ${
          waiting
            ? "border-amber-300 bg-amber-50 hover:border-amber-400"
            : "border-border bg-background hover:border-brand-crimson/40"
        }`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            waiting ? "bg-amber-500 text-white" : "bg-green-100 text-green-700"
          }`}
        >
          {waiting ? <ClipboardCheck className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-ui text-3xl font-bold text-heading">{waiting}</span>
          <span className="block font-ui text-sm text-foreground-muted">
            {waiting ? ax("খবর অনুমোদনের অপেক্ষায়") : ax("অনুমোদনের অপেক্ষায় কিছু নেই")}
            {" · "}
            {ax("আজ জমা")} {today}
          </span>
        </span>
        <ArrowRight className="h-5 w-5 text-foreground-muted transition-transform group-hover:translate-x-1" />
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-ui text-sm font-semibold text-heading">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {ax("এখন অনলাইনে")} ({online.length})
          </p>
          <Link href="/admin/team" className="flex items-center gap-1 font-ui text-xs font-semibold text-brand-crimson hover:underline">
            <Activity className="h-3.5 w-3.5" />
            {t("teamNav")}
          </Link>
        </div>
        {online.length === 0 ? (
          <p className="mt-3 font-ui text-xs text-foreground-muted">{ax("এই মুহূর্তে কেউ প্যানেলে নেই")}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {online.slice(0, 5).map((o) => {
              const page = o.pages[0];
              return (
                <li key={o.userId} className="flex items-center gap-2.5">
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy font-ui text-[11px] font-bold text-white">
                    {o.name.charAt(0).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-ui text-xs text-foreground">
                    <b>{o.name}</b>{" "}
                    <span className="text-foreground-muted">
                      ({t(`role${o.role}` as AdminKey)}) —{" "}
                      {page ? adminPageLabel(page, t, ax) : ax("প্যানেল খুলছেন…")}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface MyStats {
  stats: {
    total: number;
    published: number;
    pending: number;
    rejected: number;
    drafts: number;
    revisionsPending: number;
    today: number;
  };
  recent: {
    id: string;
    title: string;
    status: "DRAFT" | "SCHEDULED" | "PENDING" | "REJECTED" | "PUBLISHED";
    reviewNote: string | null;
    updatedAt: string;
  }[];
}

const STATUS_CLS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-brand-crimson/10 text-brand-crimson",
  SCHEDULED: "bg-brand-navy/10 text-brand-navy",
  DRAFT: "bg-surface text-foreground-muted",
};

/** A staff member's own figures: what they have filed and where each stands. */
export function MyWork() {
  const t = useAdminT();
  const ax = useAdminText();
  const { can } = useAdminAuth();
  const [d, setD] = useState<MyStats | null>(null);

  const load = useCallback(
    () =>
      apiFetch<MyStats>("/api/admin/my/stats")
        .then(setD)
        .catch(() => {}),
    [],
  );

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("notification:new", load);
    socket.on("content:changed", load);
    return () => {
      socket.off("notification:new", load);
      socket.off("content:changed", load);
    };
  }, [load]);

  if (!d) return null;
  const s = d.stats;
  const tiles = [
    { icon: PenLine, label: "আজ লিখেছেন", value: s.today, cls: "bg-brand-navy/10 text-brand-navy" },
    { icon: Hourglass, label: "অনুমোদনের অপেক্ষায়", value: s.pending + s.revisionsPending, cls: "bg-amber-50 text-amber-600" },
    { icon: CheckCircle2, label: "প্রকাশিত", value: s.published, cls: "bg-green-50 text-green-700" },
    { icon: XCircle, label: "বাতিল হয়েছে", value: s.rejected, cls: "bg-brand-crimson/10 text-brand-crimson" },
    { icon: FileText, label: "খসড়া", value: s.drafts, cls: "bg-surface text-foreground-muted" },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
          {ax("আমার কাজ")}
        </h2>
        {can("articles", "edit") && (
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-3 py-1.5 font-ui text-xs font-semibold text-white hover:bg-brand-crimson-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("newArticle")}
          </Link>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border p-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-ui text-lg font-bold text-heading">{value}</span>
              <span className="block font-ui text-[11px] text-foreground-muted">{ax(label)}</span>
            </span>
          </div>
        ))}
      </div>
      {d.recent.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {d.recent.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2">
              <Link
                href={`/admin/articles/${a.id}/edit`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-brand-crimson"
              >
                {a.title}
                {a.status === "REJECTED" && a.reviewNote && (
                  <span className="ml-2 font-ui text-xs text-brand-crimson">“{a.reviewNote}”</span>
                )}
              </Link>
              <span className={`shrink-0 rounded-full px-2 py-0.5 font-ui text-[11px] font-semibold ${STATUS_CLS[a.status]}`}>
                {t(`status${a.status}` as AdminKey)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
