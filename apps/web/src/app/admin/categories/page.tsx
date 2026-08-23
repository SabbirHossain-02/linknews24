"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { Modal } from "@/components/admin/Modal";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [busy, setBusy] = useState(false);

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

  /**
   * Deletes a category. When it holds articles the caller has to say what
   * happens to them — move them to another category, or delete them too.
   *
   * Errors surface inside the dialog rather than in a banner at the top of the
   * page, which is off-screen once you have scrolled to the row you are
   * deleting — that is why the first attempt looked like nothing happened.
   */
  const remove = async (
    id: string,
    choice?: { moveTo: string } | { withArticles: true },
  ) => {
    setBusy(true);
    setDeleteError(null);
    try {
      let query = "";
      if (choice && "moveTo" in choice)
        query = `?moveTo=${encodeURIComponent(choice.moveTo)}`;
      else if (choice) query = "?withArticles=true";

      await apiFetch(`/api/admin/categories/${id}${query}`, {
        method: "DELETE",
      });
      closeDelete();
      load();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "মুছতে পারা গেল না");
    } finally {
      setBusy(false);
    }
  };

  const closeDelete = () => {
    setDeleteId(null);
    setDeleteError(null);
    setMoveTo("");
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">{t("categoriesTags")}</h1>

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

      {deleteId && (() => {
        const target = cats.find((c) => c.id === deleteId);
        const count = target?._count?.articles ?? 0;
        const others = cats.filter((c) => c.id !== deleteId);

        return (
          <Modal title={`"${target?.name}" মুছে ফেলুন`} onClose={closeDelete}>
            {count === 0 ? (
              <p className="font-ui text-sm text-foreground-muted">
                এই ক্যাটাগরিতে কোনো আর্টিকেল নেই। মুছে ফেলবেন?
              </p>
            ) : (
              <>
                <p className="font-ui text-sm text-foreground">
                  এই ক্যাটাগরিতে{" "}
                  <b className="text-brand-crimson">{count}টি আর্টিকেল</b> আছে।
                  সেগুলোর কী হবে?
                </p>

                <div className="mt-4 rounded-lg border border-border p-3">
                  <p className="font-ui text-xs font-semibold text-foreground">
                    অন্য ক্যাটাগরিতে সরিয়ে নিন
                  </p>
                  <p className="mt-0.5 font-ui text-[11px] text-foreground-muted">
                    আর্টিকেলগুলো থেকে যাবে, শুধু ক্যাটাগরিটা বদলাবে।
                  </p>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={moveTo}
                      onChange={(e) => setMoveTo(e.target.value)}
                      className={`${inputCls} flex-1`}
                    >
                      <option value="">ক্যাটাগরি বাছুন…</option>
                      {others.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!moveTo || busy}
                      onClick={() => remove(deleteId, { moveTo })}
                      className="shrink-0 rounded-lg border border-border px-3 py-2 font-ui text-xs font-medium text-foreground hover:bg-surface disabled:opacity-40"
                    >
                      সরিয়ে মুছুন
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-brand-crimson/40 bg-brand-crimson/5 p-3">
                  <p className="font-ui text-xs font-semibold text-brand-crimson">
                    আর্টিকেলসহ মুছে ফেলুন
                  </p>
                  <p className="mt-0.5 font-ui text-[11px] leading-relaxed text-foreground-muted">
                    {count}টি আর্টিকেল ও সেগুলোর সব কমেন্ট চিরতরে মুছে যাবে।
                    <b> ফেরত আনা যাবে না।</b>
                  </p>
                </div>
              </>
            )}

            {deleteError && (
              <p className="mt-3 rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-xs text-brand-crimson">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDelete}
                className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  remove(deleteId, count > 0 ? { withArticles: true } : undefined)
                }
                className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
              >
                {busy
                  ? "মোছা হচ্ছে…"
                  : count > 0
                    ? `আর্টিকেলসহ মুছুন (${count})`
                    : "মুছে ফেলুন"}
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
