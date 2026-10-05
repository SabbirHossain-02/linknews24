"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Newspaper, Pencil, Plus, Radio, Trash2, Type } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { ConfirmModal } from "@/components/admin/Modal";
import { Toggle } from "@/components/admin/Toggle";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminT } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";

interface BreakingItem {
  id: string;
  text: string;
  textEn: string;
  active: boolean;
  order: number;
}

interface BreakingArticle {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  publishedAt: string | null;
}

interface Payload {
  items: BreakingItem[];
  articles: BreakingArticle[];
  enabled: boolean;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

/**
 * Everything on the breaking-news bar, in one place.
 *
 * The bar carries two kinds of line: stories whose "breaking" switch is on,
 * and short lines typed here. Both are listed, so what the page shows is what
 * readers see — and one switch at the top turns the whole bar off or on.
 */
export default function BreakingAdminPage() {
  const t = useAdminT();
  const ax = useAdminText();
  const { can } = useAdminAuth();
  const canEdit = can("breaking", "edit");
  const canDelete = can("breaking", "delete");
  const [data, setData] = useState<Payload | null>(null);
  const [text, setText] = useState("");
  const [textEn, setTextEn] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      apiFetch<Payload>("/api/admin/breaking")
        .then(setData)
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    load();
    // A story flagged breaking from the editor shows up here at once.
    const socket = getSocket();
    socket.on("content:changed", load);
    return () => {
      socket.off("content:changed", load);
    };
  }, [load]);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : "Error");

  const setEnabled = async (enabled: boolean) => {
    if (!data) return;
    const before = data;
    setData({ ...data, enabled });
    try {
      await apiFetch("/api/admin/breaking/settings", {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      });
    } catch (e) {
      setData(before);
      fail(e);
    }
  };

  const add = async () => {
    if (!text.trim()) return;
    try {
      await apiFetch("/api/admin/breaking", {
        method: "POST",
        body: JSON.stringify({ text, textEn }),
      });
      setText("");
      setTextEn("");
      load();
    } catch (e) {
      fail(e);
    }
  };

  // Applied on screen first, so the row does not wait for the round trip and
  // the list is not rebuilt underneath the pointer.
  const update = async (id: string, patch: Partial<BreakingItem>) => {
    if (!data) return;
    const before = data;
    setData({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
    try {
      await apiFetch(`/api/admin/breaking/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
    } catch (e) {
      setData(before);
      fail(e);
    }
  };

  const unflag = async (id: string) => {
    if (!data) return;
    const before = data;
    setData({ ...data, articles: data.articles.filter((a) => a.id !== id) });
    try {
      await apiFetch(`/api/admin/breaking/articles/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isBreaking: false }),
      });
    } catch (e) {
      setData(before);
      fail(e);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/admin/breaking/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      fail(e);
    }
  };

  if (!data)
    return <p className="font-ui text-sm text-foreground-muted">{error ?? t("loading")}</p>;

  const liveLines =
    data.articles.length + data.items.filter((i) => i.active).length;

  return (
    <div className="max-w-3xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-heading">
        <Radio className="h-6 w-6 text-brand-crimson" />
        {t("breaking")}
      </h1>

      {/* The one switch for the whole bar */}
      <div
        className={`mt-5 flex items-center gap-4 rounded-2xl border p-5 transition-colors ${
          data.enabled ? "border-brand-crimson/30 bg-brand-crimson/[0.04]" : "border-border bg-background"
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            data.enabled ? "bg-brand-crimson text-white" : "bg-surface text-foreground-muted"
          }`}
        >
          <Radio className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-ui text-sm font-bold text-heading">
            {data.enabled ? ax("ব্রেকিং বার চালু আছে") : ax("ব্রেকিং বার বন্ধ আছে")}
          </p>
          <p className="mt-0.5 font-ui text-xs text-foreground-muted">
            {data.enabled
              ? `${ax("সাইটের হেডারে এখন")} ${liveLines} ${ax("টি লাইন চলছে।")}`
              : ax("পাঠকেরা কোনো ব্রেকিং বার দেখছেন না। নিচের খবরগুলো রাখা আছে — চালু করলেই আবার দেখাবে।")}
          </p>
        </div>
        <Toggle
          size="md"
          checked={data.enabled}
          disabled={!canEdit}
          onChange={setEnabled}
          title={ax("পুরো ব্রেকিং বার চালু/বন্ধ")}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      {/* Stories flagged breaking */}
      <h2 className="mt-7 flex items-center gap-2 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
        <Newspaper className="h-4 w-4" />
        {ax("ব্রেকিং খবর")} ({data.articles.length})
      </h2>
      <p className="mt-1 font-ui text-xs text-foreground-muted">
        {ax("আর্টিকেলে 'ব্রেকিং' চালু করা প্রকাশিত খবর। সুইচ বন্ধ করলে খবরটি বার থেকে সরে যাবে, খবর নিজে থাকবে।")}
      </p>
      <div className={`mt-3 flex flex-col gap-2 ${data.enabled ? "" : "opacity-60"}`}>
        {data.articles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center font-ui text-sm text-foreground-muted">
            {ax("কোনো খবরে ব্রেকিং চালু নেই")}
          </p>
        ) : (
          data.articles.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
            >
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-crimson" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{a.title}</p>
              <a
                href={`/${a.slug}`}
                target="_blank"
                rel="noreferrer"
                title={ax("সাইটে দেখুন")}
                className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              {can("articles", "edit") && (
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  title={t("edit")}
                  className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              )}
              <Toggle
                checked
                disabled={!canEdit}
                onChange={() => unflag(a.id)}
                title={ax("ব্রেকিং থেকে সরান")}
              />
            </div>
          ))
        )}
      </div>

      {/* Typed lines */}
      <h2 className="mt-7 flex items-center gap-2 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
        <Type className="h-4 w-4" />
        {ax("নিজে লেখা লাইন")} ({data.items.length})
      </h2>
      <p className="mt-1 font-ui text-xs text-foreground-muted">
        {ax("খবর ছাড়াই ছোট একটি লাইন বারে দেখাতে চাইলে এখানে লিখুন।")}
      </p>

      {canEdit && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-background p-4 sm:flex-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("textBn")}
            className={inputCls}
          />
          <input
            value={textEn}
            onChange={(e) => setTextEn(e.target.value)}
            placeholder={t("textEnLabel")}
            className={inputCls}
          />
          <button
            onClick={add}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
          >
            <Plus className="h-4 w-4" />
            {t("addItem")}
          </button>
        </div>
      )}

      <div className={`mt-3 flex flex-col gap-2 ${data.enabled ? "" : "opacity-60"}`}>
        {data.items.length === 0 ? (
          <p className="font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          data.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
            >
              <input
                defaultValue={item.text}
                disabled={!canEdit}
                onBlur={(e) =>
                  e.target.value !== item.text && update(item.id, { text: e.target.value })
                }
                className={inputCls}
              />
              <input
                defaultValue={item.textEn}
                disabled={!canEdit}
                onBlur={(e) =>
                  e.target.value !== item.textEn && update(item.id, { textEn: e.target.value })
                }
                className={inputCls}
              />
              <Toggle
                checked={item.active}
                disabled={!canEdit}
                onChange={(next) => update(item.id, { active: next })}
                title={t("active")}
              />
              {canDelete && (
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                  title={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {deleteId && (
        <ConfirmModal
          title={t("deleteTitle")}
          message={t("deleteMessage")}
          onConfirm={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
