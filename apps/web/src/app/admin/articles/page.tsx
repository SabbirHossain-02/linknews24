"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { Toggle } from "@/components/admin/Toggle";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  isBreaking: boolean;
  authorName: string | null;
  featuredImage: string | null;
  category: { name: string } | null;
  author: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  _count?: { articles: number };
}

const PER_PAGE = 20;
const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function AdminArticlesPage() {
  const t = useAdminT();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Guards against out-of-order responses: only the newest request's result wins.
  const reqId = useRef(0);

  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const id = ++reqId.current;
    setLoading(true);
    apiFetch<{ articles: AdminArticle[]; total: number }>(
      `/api/admin/articles?${params.toString()}`,
    )
      .then((d) => {
        if (id !== reqId.current) return; // a newer request superseded this one
        setArticles(d.articles);
        setTotal(d.total);
      })
      .catch(() => {})
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [page, q, category, status]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/admin/categories")
      .then((d) => setCats(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0); // debounce search typing
    return () => clearTimeout(timer);
  }, [load, q]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [q, category, status]);

  /**
   * Flips the switch on screen first, then tells the server.
   *
   * This used to await the request and reload the whole list. Two things went
   * wrong with that: the list is paged and re-sorted server-side, so the row
   * you clicked could move somewhere else and the click looked like it had
   * done nothing; and the reload emptied the table for a moment, which
   * collapsed the page and threw the scroll position around.
   */
  const patchFlags = async (id: string, body: Record<string, unknown>) => {
    const before = articles;
    setArticles((list) =>
      list.map((a) => (a.id === id ? ({ ...a, ...body } as AdminArticle) : a)),
    );
    try {
      const d = await apiFetch<{ article: AdminArticle }>(
        `/api/admin/articles/${id}/flags`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      // Trust the server for the flags themselves, but keep the joined
      // category and author the flags endpoint does not return.
      setArticles((list) =>
        list.map((a) =>
          a.id === id
            ? { ...a, status: d.article.status, isBreaking: d.article.isBreaking }
            : a,
        ),
      );
    } catch {
      setArticles(before); // the server refused — put the row back as it was
    }
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("articles")}</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("newArticle")}
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchByTitle")}
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          <option value="">{t("allCategories")}</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c._count?.articles ?? 0})
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputCls}
        >
          <option value="">{t("allStatus")}</option>
          <option value="PUBLISHED">{t("statusPUBLISHED")}</option>
          <option value="DRAFT">{t("statusDRAFT")}</option>
          <option value="SCHEDULED">{t("statusSCHEDULED")}</option>
        </select>
        <span className="ml-auto font-ui text-sm text-foreground-muted">
          {t("totalLabel")}: {total}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
            <tr>
              <th className="px-4 py-3">{t("colTitle")}</th>
              <th className="px-4 py-3">{t("colCategory")}</th>
              <th className="px-4 py-3">{t("colStatus")}</th>
              <th className="px-4 py-3">{t("colBreaking")}</th>
              <th className="px-4 py-3 text-right">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Rows stay put while a new page loads. Blanking them made the
                table collapse and the page jump. */}
            {articles.length === 0 ? (
              loading ? null : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                    {t("noArticles")}
                  </td>
                </tr>
              )
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {a.featuredImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.featuredImage}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{a.title}</p>
                        <p className="font-ui text-xs text-foreground-muted">
                          {a.authorName || a.author?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {a.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        patchFlags(a.id, {
                          status: a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                        })
                      }
                      className={`rounded-full px-2.5 py-1 font-ui text-xs font-semibold ${
                        a.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-surface text-foreground-muted"
                      }`}
                    >
                      {t(`status${a.status}` as AdminKey)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={a.isBreaking}
                      onChange={(next) => patchFlags(a.id, { isBreaking: next })}
                      title={t("breakingNews")}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                        title={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(a.id)}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                        title={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("prev")}
          </button>
          <span className="font-ui text-sm text-foreground-muted">
            {t("pageOf", { p: page, t: totalPages })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-40"
          >
            {t("next")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {deleteId && (
        <ConfirmModal
          title={t("deleteTitle")}
          message={t("deleteMessage")}
          confirmLabel={t("remove")}
          onConfirm={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
