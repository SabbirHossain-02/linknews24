"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  visible: boolean;
  _count?: { articles: number };
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function CategoriesAdminPage() {
  const t = useAdminT();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ categories: Category[] }>("/api/admin/categories")
      .then((d) => setCats(d.categories))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim() || !nameEn.trim()) return;
    await apiFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name, nameEn }),
    });
    setName("");
    setNameEn("");
    load();
  };

  const update = async (id: string, patch: Partial<Category>) => {
    await apiFetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    load();
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">{t("categoriesTags")}</h1>

      {error && (
        <p className="mt-3 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-border bg-background p-4 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("nameBn")}
          className={inputCls}
        />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder={t("nameEn")}
          className={inputCls}
        />
        <button
          onClick={add}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addCategory")}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {loading ? null : (
          cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
            >
              <input
                defaultValue={c.name}
                onBlur={(e) =>
                  e.target.value !== c.name && update(c.id, { name: e.target.value })
                }
                className={inputCls}
              />
              <input
                defaultValue={c.nameEn}
                onBlur={(e) =>
                  e.target.value !== c.nameEn &&
                  update(c.id, { nameEn: e.target.value })
                }
                className={inputCls}
              />
              <span className="w-20 shrink-0 text-center font-ui text-xs text-foreground-muted">
                {c._count?.articles ?? 0} {t("colArticles")}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={c.visible}
                onClick={() => update(c.id, { visible: !c.visible })}
                title={t("visible")}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  c.visible ? "bg-brand-crimson" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    c.visible ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <button
                onClick={() => setDeleteId(c.id)}
                className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                title={t("delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
