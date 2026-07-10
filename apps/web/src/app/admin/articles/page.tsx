"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  isBreaking: boolean;
  featured: boolean;
  authorName: string | null;
  category: { name: string } | null;
  author: { name: string } | null;
  updatedAt: string;
}

export default function AdminArticlesPage() {
  const t = useAdminT();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ articles: AdminArticle[] }>("/api/admin/articles")
      .then((d) => setArticles(d.articles))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const patchFlags = async (id: string, body: Record<string, unknown>) => {
    await apiFetch(`/api/admin/articles/${id}/flags`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    load();
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

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background">
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
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                  {t("loading")}
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                  {t("noArticles")}
                </td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="font-ui text-xs text-foreground-muted">
                      {a.authorName || a.author?.name}
                    </p>
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
                    <button
                      onClick={() => patchFlags(a.id, { isBreaking: !a.isBreaking })}
                      role="switch"
                      aria-checked={a.isBreaking}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        a.isBreaking ? "bg-brand-crimson" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          a.isBreaking ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
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
