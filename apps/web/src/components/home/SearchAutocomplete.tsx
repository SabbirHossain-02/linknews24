"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, FolderOpen, Loader2, Search } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { toneGradientClass } from "@/lib/tone";
import { useLocale } from "@/components/providers/LocaleProvider";
import { TimeAgo } from "./TimeAgo";
import type { Article } from "@/types/content";

interface SuggestArticle {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  featuredImage: string | null;
  imageTone: string;
  publishedAt: string | null;
  category: { name: string; nameEn: string };
}

interface SuggestCategory {
  name: string;
  nameEn: string;
  slug: string;
}

const VIRAMA = "\u09CD";
const isMark = (c: string) => /\p{M}/u.test(c) || c === "\u200C" || c === "\u200D";

/**
 * Widens a match to whole Bengali letters. Marking only "প" inside "প্র", or
 * "স" without the "ি" that follows it, splits a letter across two elements
 * and the browser draws it broken ("প ্র", "স ি"); the mark has to take the
 * whole cluster — vowel signs, and consonants joined by a hasanta.
 */
function wholeLetters(text: string, start: number, end: number): [number, number] {
  while (start > 1 && text[start - 1] === VIRAMA) start -= 2;
  if (end > start && text[end - 1] === VIRAMA && end < text.length) end += 1;
  while (end < text.length) {
    if (text[end] === VIRAMA && end + 1 < text.length) end += 2;
    else if (isMark(text[end])) end += 1;
    else break;
  }
  return [start, end];
}

/** The part of a headline that matches what was typed, marked. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.normalize("NFC").trim();
  const t = text.normalize("NFC");
  if (!q) return <>{t}</>;
  const i = t.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());
  if (i < 0) return <>{t}</>;
  const [a, b] = wholeLetters(t, i, i + q.length);
  return (
    <>
      {t.slice(0, a)}
      <mark className="rounded-sm bg-brand-crimson/15 text-brand-crimson">{t.slice(a, b)}</mark>
      {t.slice(b)}
    </>
  );
}

/**
 * The search box, with stories suggested from the first letter typed.
 *
 * Suggestions come from the headlines (those that begin with the letters first)
 * and matching categories; arrow keys move through them, Enter opens the one
 * picked — or, with none picked, runs the full search the form always ran.
 * It stays an ordinary GET form underneath, so search works without script.
 */
export function SearchAutocomplete({
  defaultValue = "",
  placeholder,
  autoFocus,
}: {
  defaultValue?: string;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const { locale } = useLocale();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [articles, setArticles] = useState<SuggestArticle[]>([]);
  const [categories, setCategories] = useState<SuggestCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();
  const L = (bn: string, en: string) => (locale === "en" ? en : bn);

  // Each keystroke asks again, a moment after typing pauses; an older answer
  // arriving late is thrown away.
  useEffect(() => {
    const q = value.trim();
    if (!q) {
      setArticles([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`${API_BASE}/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setArticles(d.articles ?? []);
          setCategories(d.categories ?? []);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false);
        });
    }, 160);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // One list for the keyboard: categories, stories, then "all results".
  const items = [
    ...categories.map((c) => ({ href: `/${c.slug}` })),
    ...articles.map((a) => ({ href: `/${a.slug}` })),
    { href: `/search?q=${encodeURIComponent(value.trim())}` },
  ];
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !value.trim()) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(items[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && value.trim().length > 0;
  const catName = (c: { name: string; nameEn: string }) =>
    locale === "en" ? c.nameEn || c.name : c.name;
  const rowCls = (i: number) =>
    `flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
      i === active ? "bg-surface" : "hover:bg-surface"
    }`;

  return (
    <div ref={box} className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      <input
        type="text"
        name="q"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-foreground-muted" />
      )}

      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background py-1.5 shadow-[0_12px_40px_rgba(20,24,31,0.18)]"
        >
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b border-border px-4 pb-2.5 pt-1.5">
              {categories.map((c, i) => (
                <button
                  key={c.slug}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(`/${c.slug}`)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-ui text-xs font-semibold transition-colors ${
                    i === active
                      ? "border-brand-crimson bg-brand-crimson text-white"
                      : "border-border text-foreground hover:border-brand-crimson hover:text-brand-crimson"
                  }`}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <Highlight text={catName(c)} query={value} />
                </button>
              ))}
            </div>
          )}

          {articles.length === 0 && !loading ? (
            <p className="px-4 py-4 text-center font-ui text-sm text-foreground-muted">
              {L("এই অক্ষরে কোনো শিরোনাম মেলেনি", "No headline matches yet")}
            </p>
          ) : (
            articles.map((a, j) => {
              const i = categories.length + j;
              const title = locale === "en" ? a.titleEn || a.title : a.title;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(`/${a.slug}`)}
                  className={rowCls(i)}
                >
                  <span
                    className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-md ${toneGradientClass(
                      a.imageTone as Article["imageTone"],
                    )}`}
                  >
                    {a.featuredImage && (
                      <Image src={a.featuredImage} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                      <Highlight text={title} query={value} />
                    </span>
                    <span className="mt-0.5 block font-ui text-[11px] text-foreground-muted">
                      <span className="text-brand-crimson">{catName(a.category)}</span>
                      {a.publishedAt && (
                        <>
                          {" · "}
                          <TimeAgo iso={a.publishedAt} />
                        </>
                      )}
                    </span>
                  </span>
                </button>
              );
            })
          )}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => go(items[items.length - 1].href)}
            className={`${rowCls(items.length - 1)} mt-1 border-t border-border font-ui text-sm font-semibold text-brand-crimson`}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate">
              {L(`“${value.trim()}” দিয়ে সব খবর খুঁজুন`, `Search all stories for “${value.trim()}”`)}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
