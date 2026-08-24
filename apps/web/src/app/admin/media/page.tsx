"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImageDown, Link2, Trash2, Upload } from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";
import {
  canCopyImage,
  copyImage,
  copyText,
  downloadImage,
} from "@/lib/media-clipboard";

interface MediaItem {
  id: string;
  url: string;
  createdAt: string;
}

function IconBtn({
  title,
  onClick,
  icon,
  dim,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  /** Still usable — it explains itself when pressed — but visibly secondary. */
  dim?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-surface hover:text-brand-crimson ${
        dim ? "text-foreground-muted/40" : "text-foreground-muted"
      }`}
    >
      {icon}
    </button>
  );
}

export default function MediaAdminPage() {
  const t = useAdminT();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // What just happened, on which picture — shown on the card itself.
  const [flash, setFlash] = useState<{ id: string; text: string } | null>(null);
  const [imageCopyable, setImageCopyable] = useState(false);

  // Whether the browser will allow copying a picture depends on the page being
  // served over HTTPS, so it can only be known once we are running.
  useEffect(() => setImageCopyable(canCopyImage()), []);

  const say = (id: string, text: string) => {
    setFlash({ id, text });
    setTimeout(() => setFlash((f) => (f?.id === id ? null : f)), 2600);
  };

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

  const onCopyUrl = async (m: MediaItem) => {
    const r = await copyText(m.url);
    say(m.id, r.ok ? t("copied") : t("mediaCopyFailed"));
  };

  const onCopyImage = async (m: MediaItem) => {
    say(m.id, t("mediaCopying"));
    const r = await copyImage(m.url);
    say(
      m.id,
      r.ok
        ? t("mediaImageCopied")
        : r.reason === "insecure"
          ? t("mediaNeedsHttps")
          : t("mediaCopyFailed"),
    );
  };

  const onDownload = async (m: MediaItem) => {
    say(m.id, t("mediaDownloading"));
    const ok = await downloadImage(m.url);
    say(m.id, ok ? t("mediaDownloaded") : t("mediaDownloadFailed"));
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

      {loading ? null : items.length === 0 ? (
        <p className="mt-5 font-ui text-sm text-foreground-muted">{t("noMedia")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="aspect-video w-full object-cover" />
                {flash?.id === m.id && (
                  <span className="absolute inset-x-2 bottom-2 rounded-md bg-brand-navy/90 px-2 py-1 text-center font-ui text-[11px] leading-snug text-white">
                    {flash.text}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex items-center gap-0.5">
                  <IconBtn
                    title={t("mediaDownload")}
                    onClick={() => onDownload(m)}
                    icon={<Download className="h-3.5 w-3.5" />}
                  />
                  <IconBtn
                    title={
                      imageCopyable ? t("mediaCopyImage") : t("mediaNeedsHttps")
                    }
                    onClick={() => onCopyImage(m)}
                    icon={<ImageDown className="h-3.5 w-3.5" />}
                    dim={!imageCopyable}
                  />
                  <IconBtn
                    title={t("copyUrl")}
                    onClick={() => onCopyUrl(m)}
                    icon={<Link2 className="h-3.5 w-3.5" />}
                  />
                </div>
                <IconBtn
                  title={t("delete")}
                  onClick={() => setDeleteId(m.id)}
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                />
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
