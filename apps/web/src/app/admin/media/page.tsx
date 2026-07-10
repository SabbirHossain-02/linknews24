"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface MediaItem {
  id: string;
  url: string;
  createdAt: string;
}

export default function MediaAdminPage() {
  const t = useAdminT();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    apiFetch<{ media: MediaItem[] }>("/api/admin/media")
      .then((d) => setItems(d.media))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) await uploadFile(f);
      load();
    } finally {
      setUploading(false);
    }
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/media/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("media")}</h1>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? t("saving") : t("uploadImages")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
        />
      </div>

      {loading ? (
        <p className="mt-5 font-ui text-sm text-foreground-muted">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="mt-5 font-ui text-sm text-foreground-muted">{t("noMedia")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-xl border border-border bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="aspect-video w-full object-cover" />
              <div className="flex items-center justify-between p-2">
                <button
                  onClick={() => copy(m.url)}
                  className="flex items-center gap-1 font-ui text-xs text-foreground-muted hover:text-brand-crimson"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === m.url ? t("copied") : t("copyUrl")}
                </button>
                <button
                  onClick={() => setDeleteId(m.id)}
                  className="text-foreground-muted hover:text-brand-crimson"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
