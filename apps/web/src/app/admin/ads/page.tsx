"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerClick, Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

type Placement = "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "POPUP";

interface Ad {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: Placement;
  active: boolean;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";
  amount: number;
  days: number;
  impressions: number;
  clicks: number;
  startsAt: string | null;
  endsAt: string | null;
  account: { name: string; email: string } | null;
}

const PLACEMENTS: Placement[] = ["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "POPUP"];

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

const EMPTY = {
  name: "",
  imageUrl: "",
  linkUrl: "",
  placement: "SIDEBAR" as Placement,
  active: true,
  startsAt: "",
  endsAt: "",
};

export default function AdsAdminPage() {
  const t = useAdminT();
  const [ads, setAds] = useState<Ad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const load = useCallback(() => {
    const id = ++reqId.current;
    apiFetch<{ ads: Ad[] }>("/api/admin/ads")
      .then((d) => {
        if (id === reqId.current) setAds(d.ads);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setError(null);
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  // Edit an existing ad — same form, prefilled. Dates come back as ISO, but the
  // <input type="date"> only accepts YYYY-MM-DD.
  const openEdit = (ad: Ad) => {
    setError(null);
    setEditId(ad.id);
    setForm({
      name: ad.name,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      placement: ad.placement,
      active: ad.active,
      startsAt: ad.startsAt ? ad.startsAt.slice(0, 10) : "",
      endsAt: ad.endsAt ? ad.endsAt.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      set("imageUrl", await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.linkUrl.trim()) return setError(t("errSave"));
    if (!form.imageUrl) return setError(t("adImageRequired"));
    const body = JSON.stringify({
      ...form,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    });
    try {
      await apiFetch(editId ? `/api/admin/ads/${editId}` : "/api/admin/ads", {
        method: editId ? "PUT" : "POST",
        body,
      });
    } catch (err) {
      return setError(err instanceof Error ? err.message : t("errSave"));
    }
    setShowForm(false);
    setEditId(null);
    load();
  };

  const toggleActive = async (ad: Ad) => {
    await apiFetch(`/api/admin/ads/${ad.id}`, {
      method: "PUT",
      body: JSON.stringify({ active: !ad.active }),
    });
    load();
  };

  const setStatus = async (ad: Ad, status: "ACTIVE" | "REJECTED") => {
    await apiFetch(`/api/admin/ads/${ad.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("ads")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addAd")}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ads.length === 0 ? (
          <p className="col-span-full rounded-xl border border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noAds")}
          </p>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="overflow-hidden rounded-xl border border-border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.imageUrl} alt={ad.name} className="h-32 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-semibold text-foreground">{ad.name}</p>
                  <span className="shrink-0 rounded bg-brand-navy/10 px-1.5 py-0.5 font-ui text-[11px] font-semibold text-brand-navy">
                    {t(`place${ad.placement}` as AdminKey)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 font-ui text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {ad.impressions}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5" /> {ad.clicks}
                  </span>
                  <span>
                    {ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                      : "0.0"}
                    % {t("dashCtr")}
                  </span>
                </div>
                {ad.account && (
                  <p className="mt-2 font-ui text-xs text-foreground-muted">
                    {t("adAdvertiser")}: {ad.account.name} · ৳
                    {ad.amount.toLocaleString("en-US")} / {ad.days}d
                  </p>
                )}
                {ad.status === "PENDING" ? (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-ui text-xs font-semibold text-amber-700">
                      {t("adPending")}
                    </span>
                    <button
                      onClick={() => setStatus(ad, "ACTIVE")}
                      className="ml-auto rounded-lg bg-green-600 px-3 py-1.5 font-ui text-xs font-semibold text-white hover:bg-green-700"
                    >
                      {t("adApprove")}
                    </button>
                    <button
                      onClick={() => setStatus(ad, "REJECTED")}
                      className="rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface"
                    >
                      {t("adReject")}
                    </button>
                    <button
                      onClick={() => openEdit(ad)}
                      title={t("edit")}
                      className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-navy"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`rounded-full px-2.5 py-1 font-ui text-xs font-semibold ${
                        ad.active && ad.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-surface text-foreground-muted"
                      }`}
                    >
                      {ad.status === "REJECTED"
                        ? t("adReject")
                        : ad.active
                          ? t("adActive")
                          : t("draftLabel")}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(ad)}
                        title={t("edit")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-navy"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ad.id)}
                        title={t("delete")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <Modal
          title={editId ? t("edit") : t("addAd")}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
        >
          <div className="flex flex-col gap-3">
            {error && (
              <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">
                {error}
              </p>
            )}
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("adName")}
              className={inputCls}
            />
            <input
              value={form.linkUrl}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder={t("adLink")}
              className={inputCls}
            />
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {t("adImage")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? t("uploadingPdf") : t("adImage")}
                </button>
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="" className="h-10 w-16 rounded object-cover" />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={pickImage}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {t("adPlacement")}
              </label>
              <select
                value={form.placement}
                onChange={(e) => set("placement", e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {t(`place${p}` as AdminKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-ui text-xs font-semibold text-foreground-muted">
                  {t("adStartsAt")}
                </label>
                <input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
              <div className="flex-1">
                <label className="font-ui text-xs font-semibold text-foreground-muted">
                  {t("adEndsAt")}
                </label>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 font-ui text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-brand-crimson"
              />
              {t("adActive")}
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
              >
                {t("cancel")}
              </button>
              <button
                onClick={submit}
                disabled={uploading}
                className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-50"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
