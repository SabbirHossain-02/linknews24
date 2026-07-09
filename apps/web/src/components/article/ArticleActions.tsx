"use client";

import { useEffect, useState } from "react";
import { Bookmark, Printer, Share2 } from "lucide-react";
import { FacebookIcon, XIcon } from "@/components/icons/SocialIcons";
import { isBookmarked, toggleBookmark } from "@/lib/auth-storage";
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

  const shareNative = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

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
      <button
        type="button"
        onClick={shareNative}
        aria-label={t("shareThis")}
        className={`${solidBtn} bg-brand-crimson`}
      >
        <Share2 className="h-4 w-4" />
      </button>

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
