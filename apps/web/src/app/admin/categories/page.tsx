"use client";

import { useEffect, useState } from "react";
import { CornerDownRight, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { Modal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  visible: boolean;
  parentId: string | null;
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

  // Inline "add a sub-category" form, keyed by the parent it belongs to.
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [subName, setSubName] = useState("");
  const [subNameEn, setSubNameEn] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

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

  const addMain = async () => {
    if (!name.trim() || !nameEn.trim()) return;
    await apiFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name, nameEn }),
    });
    setName("");
    setNameEn("");
    load();
  };

  const addSub = async (parentId: string) => {
    if (!subName.trim() || !subNameEn.trim()) return;
    setAddError(null);
    try {
      await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: subName, nameEn: subNameEn, parentId }),
      });
      setSubName("");
      setSubNameEn("");
      setAddingUnder(null);
      load();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "যোগ করা গেল না");
    }
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
   * deleting.
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

      await apiFetch(`/api/admin/categories/${id}${query}`, { method: "DELETE" });
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

  const mains = cats.filter((c) => !c.parentId);
  const subsOf = (id: string) => cats.filter((c) => c.parentId === id);

  /** Name / English-name pair plus the article count, shared by both levels. */
  const Fields = ({ c }: { c: Category }) => (
    <>
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
          e.target.value !== c.nameEn && update(c.id, { nameEn: e.target.value })
        }
        className={inputCls}
      />
      <span className="w-24 shrink-0 text-center font-ui text-xs text-foreground-muted">
        {c._count?.articles ?? 0} {t("colArticles")}
      </span>
    </>
  );

  const VisibleToggle = ({ c }: { c: Category }) => (
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
  );

  const DeleteBtn = ({ c }: { c: Category }) => (
    <button
      type="button"
      onClick={() => setDeleteId(c.id)}
      className="shrink-0 rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
      title={t("delete")}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("categoriesTags")}</h1>

      {/* Add a main category */}
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
          onClick={addMain}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addCategory")}
        </button>
      </div>

      <p className="mt-4 rounded-lg bg-surface px-3.5 py-2.5 font-ui text-xs leading-relaxed text-foreground-muted">
        প্রতিটি মেইন ক্যাটাগরির নিচে <b className="text-foreground">+ সাব-ক্যাটাগরি</b>{" "}
        বোতাম আছে। সেখানে একটি যোগ করলেই সাইটের মেনুতে ওই ক্যাটাগরিটি{" "}
        <b className="text-foreground">ড্রপডাউন</b> হয়ে যাবে — যেমন{" "}
        <b className="text-foreground">জাতীয় ▾</b>, ভেতরে সাব-ক্যাটাগরিগুলো। সাইটে
        সাথে সাথেই বদলাবে।
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {loading
          ? null
          : mains.map((main) => {
              const subs = subsOf(main.id);
              return (
                <div
                  key={main.id}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  {/* main category row */}
                  <div className="flex items-center gap-2">
                    <Fields c={main} />
                    <VisibleToggle c={main} />
                    <DeleteBtn c={main} />
                  </div>

                  {/* its sub-categories */}
                  {subs.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2 border-l-2 border-brand-crimson/30 pl-4">
                      {subs.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <CornerDownRight className="h-4 w-4 shrink-0 text-foreground-muted" />
                          <Fields c={sub} />
                          <VisibleToggle c={sub} />
                          <button
                            type="button"
                            onClick={() => update(sub.id, { parentId: null })}
                            title="মূল মেনুতে ফিরিয়ে নিন"
                            className="shrink-0 rounded px-2 py-1 font-ui text-[11px] text-foreground-muted hover:bg-surface hover:text-foreground"
                          >
                            বের করুন
                          </button>
                          <DeleteBtn c={sub} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* add a sub-category under this one */}
                  {addingUnder === main.id ? (
                    <div className="mt-2 flex flex-col gap-2 border-l-2 border-brand-crimson/30 pl-4 sm:flex-row">
                      <input
                        autoFocus
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        placeholder={`${main.name}-এর ভেতরে — নাম (বাংলা)`}
                        className={inputCls}
                      />
                      <input
                        value={subNameEn}
                        onChange={(e) => setSubNameEn(e.target.value)}
                        placeholder="Name (English)"
                        className={inputCls}
                      />
                      <button
                        onClick={() => addSub(main.id)}
                        className="shrink-0 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
                      >
                        যোগ করুন
                      </button>
                      <button
                        onClick={() => {
                          setAddingUnder(null);
                          setAddError(null);
                        }}
                        title="বাতিল"
                        className="shrink-0 rounded-lg border border-border px-2 py-2 text-foreground-muted hover:bg-surface"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingUnder(main.id);
                        setSubName("");
                        setSubNameEn("");
                        setAddError(null);
                      }}
                      className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 font-ui text-xs text-foreground-muted hover:border-brand-crimson hover:text-brand-crimson"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      সাব-ক্যাটাগরি
                    </button>
                  )}

                  {addError && addingUnder === main.id && (
                    <p className="mt-2 font-ui text-xs text-brand-crimson">
                      {addError}
                    </p>
                  )}
                </div>
              );
            })}
      </div>

      {deleteId &&
        (() => {
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
                    remove(
                      deleteId,
                      count > 0 ? { withArticles: true } : undefined,
                    )
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
