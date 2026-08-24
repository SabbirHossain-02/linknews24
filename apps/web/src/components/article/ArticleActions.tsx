"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Link2, Mail, Printer, Send, Share2 } from "lucide-react";
import { FacebookIcon, XIcon } from "@/components/icons/SocialIcons";
import { isBookmarked, toggleBookmark } from "@/lib/auth-storage";
import { copyText } from "@/lib/media-clipboard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";

const FONT_KEY = "linknews24-font-scale";
const MIN_SCALE = 0.9;
const MAX_SCALE = 1.3;
const STEP = 0.1;

const solidBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105";
const outlineBtn =
  "flex h-9 w-9 items-center justify-center rounded-full border border-brand-crimson/40 font-bold text-brand-crimson transition-colors hover:bg-brand-crimson hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-crimson";

function ShareLink({
  label,
  icon,
  href,
  onDone,
}: {
  label: string;
  icon: React.ReactNode;
  href: string;
  onDone: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onDone}
      className="flex items-center gap-2.5 px-3 py-2 font-ui text-sm text-foreground transition-colors hover:bg-surface"
    >
      <span className="text-brand-crimson">{icon}</span>
      {label}
    </a>
  );
}

export function ArticleActions({
  article,
  title,
}: {
  article: Article;
  title: string;
}) {
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);
  const [scale, setScale] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const shareBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(isBookmarked(article.slug));
    const stored = Number(localStorage.getItem(FONT_KEY));
    if (stored) setScale(stored);
  }, [article.slug]);

  const adjust = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(scale + delta).toFixed(1)));
    setScale(next);
    document.documentElement.style.setProperty("--font-scale", String(next));
    localStorage.setItem(FONT_KEY, String(next));
  };

  const shareUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const openPopup = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");

  /**
   * The share button.
   *
   * It used to call navigator.share and, failing that, navigator.clipboard.
   * Both of those only exist over HTTPS, and this site is served over plain
   * http — so on every press the call threw, the error was swallowed, and
   * nothing happened at all. Where the phone's own share sheet is available it
   * is still the best thing to open; everywhere else there is now a real menu.
   */
  const onShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl() });
        return;
      } catch {
        // Dismissing the sheet lands here too, so fall through to the menu
        // only when it was never shown.
      }
    }
    setShareOpen((v) => !v);
  };

  const copyLink = async () => {
    const r = await copyText(shareUrl());
    setShareOpen(false);
    setFlash(r.ok ? t("shareLinkCopied") : t("shareCopyFailed"));
    setTimeout(() => setFlash(null), 2500);
  };

  // Click outside or Esc closes the share menu.
  useEffect(() => {
    if (!shareOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!shareBox.current?.contains(e.target as Node)) setShareOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [shareOpen]);

  const handleBookmark = () => {
    setSaved(
      toggleBookmark({
        slug: article.slug,
        title: article.title,
        categoryName: article.category.name,
        categorySlug: article.category.slug,
      }),
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() =>
          openPopup(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`,
          )
        }
        aria-label="Facebook"
        className={`${solidBtn} bg-[#1877F2]`}
      >
        <FacebookIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() =>
          openPopup(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(title)}`,
          )
        }
        aria-label="X"
        className={`${solidBtn} bg-black`}
      >
        <XIcon className="h-4 w-4" />
      </button>
      <div className="relative" ref={shareBox}>
        <button
          type="button"
          onClick={onShare}
          aria-label={t("shareThis")}
          aria-expanded={shareOpen}
          className={`${solidBtn} bg-brand-crimson`}
        >
          <Share2 className="h-4 w-4" />
        </button>

        {shareOpen && (
          <div className="absolute left-1/2 z-40 mt-2 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-[0_12px_40px_rgba(20,24,31,0.18)]">
            <ShareLink
              label={t("shareWhatsapp")}
              icon={<Send className="h-3.5 w-3.5" />}
              href={`https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl()}`)}`}
              onDone={() => setShareOpen(false)}
            />
            <ShareLink
              label={t("shareTelegram")}
              icon={<Send className="h-3.5 w-3.5" />}
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(title)}`}
              onDone={() => setShareOpen(false)}
            />
            <ShareLink
              label={t("shareEmail")}
              icon={<Mail className="h-3.5 w-3.5" />}
              href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl())}`}
              onDone={() => setShareOpen(false)}
            />
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-ui text-sm text-foreground transition-colors hover:bg-surface"
            >
              <Link2 className="h-3.5 w-3.5 text-brand-crimson" />
              {t("shareCopyLink")}
            </button>
          </div>
        )}

        {flash && (
          <span className="absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-navy px-2.5 py-1 font-ui text-xs text-white shadow-lg">
            {flash}
          </span>
        )}
      </div>

      <span className="mx-1 h-6 w-px bg-border" aria-hidden />

      <button
        type="button"
        onClick={() => adjust(STEP)}
        disabled={scale >= MAX_SCALE}
        aria-label={t("fontSize")}
        className={`${outlineBtn} text-sm`}
      >
        অ+
      </button>
      <button
        type="button"
        onClick={() => adjust(-STEP)}
        disabled={scale <= MIN_SCALE}
        aria-label={t("fontSize")}
        className={`${outlineBtn} text-xs`}
      >
        অ−
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        aria-label="Print"
        className={outlineBtn}
      >
        <Printer className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleBookmark}
        aria-pressed={saved}
        aria-label={saved ? t("saved") : t("save")}
        className={saved ? `${solidBtn} bg-brand-crimson` : outlineBtn}
      >
        <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
