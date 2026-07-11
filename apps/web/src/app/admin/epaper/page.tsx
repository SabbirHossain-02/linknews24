"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText, Plus, Trash2, Upload } from "lucide-react";
import { apiFetch, uploadPdf } from "@/lib/admin-api";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface Edition {
  id: string;
  date: string;
  pdfUrl: string;
  thumbnail: string | null;
  published: boolean;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

export default function EpaperAdminPage() {
  const t = useAdminT();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const load = useCallback(() => {
    const id = ++reqId.current;
    apiFetch<{ editions: Edition[] }>("/api/admin/epaper")
      .then((d) => {
        if (id === reqId.current) setEditions(d.editions);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setError(null);
    setPdfUrl("");
    setPublished(true);
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(true);
  };

  const pickPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPdfUrl(await uploadPdf(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!pdfUrl) return setError(t("epaperPdfRequired"));
    await apiFetch("/api/admin/epaper", {
      method: "POST",
      body: JSON.stringify({ date, pdfUrl, published }),
    });
    setShowForm(false);
    load();
  };

  const togglePublished = async (ed: Edition) => {
    await apiFetch(`/api/admin/epaper/${ed.id}`, {
      method: "PATCH",
      body: JSON.stringify({ published: !ed.published }),
    });
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/epaper/${id}`, { method: "DELETE" });
    load();
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("epaper")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addEdition")}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {editions.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noEditions")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {editions.map((ed) => (
              <li key={ed.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-brand-crimson" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{fmt(ed.date)}</p>
                    <a
                      href={ed.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-ui text-xs text-foreground-muted hover:text-brand-crimson"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => togglePublished(ed)}
                    className={`rounded-full px-2.5 py-1 font-ui text-xs font-semibold ${
                      ed.published
                        ? "bg-green-100 text-green-700"
                        : "bg-surface text-foreground-muted"
                    }`}
                  >
                    {ed.published ? t("publishedLabel") : t("draftLabel")}
                  </button>
                  <button
                    onClick={() => setDeleteId(ed.id)}
                    title={t("delete")}
                    className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <Modal title={t("addEdition")} onClose={() => setShowForm(false)}>
          <div className="flex flex-col gap-3">
            {error && (
              <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">
                {error}
              </p>
            )}
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {t("editionDate")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                PDF
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? t("uploadingPdf") : t("uploadPdf")}
                </button>
                {pdfUrl && (
                  <span className="flex items-center gap-1 font-ui text-xs text-green-600">
                    <FileText className="h-4 w-4" /> {t("pdfUploaded")}
                  </span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={pickPdf}
                  className="hidden"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 font-ui text-sm text-foreground">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 accent-brand-crimson"
              />
              {t("publishedLabel")}
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
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
