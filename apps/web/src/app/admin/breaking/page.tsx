"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface BreakingItem {
  id: string;
  text: string;
  textEn: string;
  active: boolean;
  order: number;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function BreakingAdminPage() {
  const t = useAdminT();
  const [items, setItems] = useState<BreakingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [textEn, setTextEn] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ items: BreakingItem[] }>("/api/admin/breaking")
      .then((d) => setItems(d.items))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!text.trim()) return;
    await apiFetch("/api/admin/breaking", {
      method: "POST",
      body: JSON.stringify({ text, textEn }),
    });
    setText("");
    setTextEn("");
    load();
  };

  const update = async (id: string, patch: Partial<BreakingItem>) => {
    await apiFetch(`/api/admin/breaking/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/breaking/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">{t("breaking")}</h1>

      {/* Add form */}
      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-border bg-background p-4 sm:flex-row">
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

      {/* List */}
      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <p className="font-ui text-sm text-foreground-muted">{t("loading")}</p>
        ) : items.length === 0 ? (
          <p className="font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
            >
              <input
                defaultValue={item.text}
                onBlur={(e) =>
                  e.target.value !== item.text &&
                  update(item.id, { text: e.target.value })
                }
                className={inputCls}
              />
              <input
                defaultValue={item.textEn}
                onBlur={(e) =>
                  e.target.value !== item.textEn &&
                  update(item.id, { textEn: e.target.value })
                }
                className={inputCls}
              />
              <button
                type="button"
                role="switch"
                aria-checked={item.active}
                onClick={() => update(item.id, { active: !item.active })}
                title={t("active")}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  item.active ? "bg-brand-crimson" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    item.active ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
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
