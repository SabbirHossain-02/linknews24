"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ListOrdered, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { SectionArticles } from "@/components/admin/SectionArticles";
import { useAdminT } from "@/lib/admin-i18n";

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

interface Section {
  id: string;
  categoryId: string | null;
  cardCount: number;
  visible: boolean;
  order: number;
  category: { name: string; nameEn: string; slug: string } | null;
}

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function HomepageBuilderPage() {
  const t = useAdminT();
  const [cats, setCats] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [cardCount, setCardCount] = useState(6);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ sections: Section[] }>("/api/admin/homepage")
      .then((d) => setSections(d.sections))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/categories")
      .then((d) => setCats(d.categories))
      .catch(() => {});
    load();
  }, []);

  const add = async () => {
    if (!categoryId) return;
    await apiFetch("/api/admin/homepage", {
      method: "POST",
      body: JSON.stringify({ categoryId, cardCount }),
    });
    setCategoryId("");
    load();
  };

  const update = async (id: string, patch: Partial<Section>) => {
    await apiFetch(`/api/admin/homepage/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = sections[index + dir];
    const current = sections[index];
    if (!target) return;
    await Promise.all([
      apiFetch(`/api/admin/homepage/${current.id}`, {
        method: "PUT",
        body: JSON.stringify({ order: target.order }),
      }),
      apiFetch(`/api/admin/homepage/${target.id}`, {
        method: "PUT",
        body: JSON.stringify({ order: current.order }),
      }),
    ]);
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/homepage/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">{t("homepageBuilder")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">{t("homepageNote")}</p>
      <p className="mt-1 font-ui text-xs text-foreground-muted/80">{t("heroHint")}</p>

      {/* Add section */}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-4">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={`${inputCls} flex-1`}
        >
          <option value="">{t("selectOption")}</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 font-ui text-xs text-foreground-muted">
          {t("cardCount")}
          <select
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            className={inputCls}
          >
            {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addSection")}
        </button>
      </div>

      {/* Sections */}
      <div className="mt-4 flex flex-col gap-2">
        {loading ? null : sections.length === 0 ? (
          <p className="font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          sections.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-border bg-background">
              <div className="flex items-center gap-3 p-3">
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-foreground-muted hover:text-brand-crimson disabled:opacity-20"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === sections.length - 1}
                  className="text-foreground-muted hover:text-brand-crimson disabled:opacity-20"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <span className="flex-1 font-medium text-foreground">
                {s.category?.name ?? "—"}
              </span>
              <label className="flex items-center gap-1.5 font-ui text-xs text-foreground-muted">
                {t("cardCount")}
                <select
                  value={s.cardCount}
                  onChange={(e) =>
                    update(s.id, { cardCount: Number(e.target.value) })
                  }
                  className={inputCls}
                >
                  {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={s.visible}
                onClick={() => update(s.id, { visible: !s.visible })}
                title={t("visible")}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  s.visible ? "bg-brand-crimson" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    s.visible ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <button
                onClick={() =>
                  s.categoryId &&
                  setExpanded(expanded === s.categoryId ? null : s.categoryId)
                }
                className={`shrink-0 rounded p-1.5 hover:bg-surface hover:text-brand-crimson ${
                  expanded === s.categoryId ? "text-brand-crimson" : "text-foreground-muted"
                }`}
                title={t("arrangeArticles")}
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteId(s.id)}
                className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                title={t("delete")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              </div>
              {expanded === s.categoryId && s.categoryId && (
                <div className="px-3 pb-3">
                  <SectionArticles categoryId={s.categoryId} />
                </div>
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
