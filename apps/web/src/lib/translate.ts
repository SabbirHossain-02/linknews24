"use client";

import { applyGlossary, bengaliDigitsToLatin } from "./bn-en-glossary";

/**
 * Bangla → English translation using Chrome's built-in on-device Translator.
 *
 * Everything here runs in the editor's own browser: no API key, no cost, and
 * — importantly for this deployment — no load on the VPS, which also hosts an
 * unrelated live site on two shared cores.
 *
 * Chrome 138+ on desktop only. Callers must check `translationAvailability()`
 * first and tell the user plainly when it is unsupported, rather than showing a
 * button that quietly does nothing.
 */

// The Translator API is not in TypeScript's DOM lib yet.
interface TranslatorInstance {
  translate(input: string): Promise<string>;
  destroy?(): void;
}

interface TranslatorFactory {
  availability(options: {
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<"unavailable" | "downloadable" | "downloading" | "available">;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: EventTarget) => void;
  }): Promise<TranslatorInstance>;
}

function factory(): TranslatorFactory | null {
  if (typeof self === "undefined") return null;
  const candidate = (self as unknown as { Translator?: TranslatorFactory })
    .Translator;
  return candidate ?? null;
}

export type Availability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available"
  | "unsupported";

/** Whether this browser can translate Bangla → English on-device. */
export async function translationAvailability(): Promise<Availability> {
  const api = factory();
  if (!api) return "unsupported";
  try {
    return await api.availability({
      sourceLanguage: "bn",
      targetLanguage: "en",
    });
  } catch {
    return "unsupported";
  }
}

/**
 * Creates a translator, reporting language-pack download progress.
 * Must be called from a user gesture — Chrome gates the download on one.
 */
async function createTranslator(
  onProgress?: (fraction: number) => void,
): Promise<TranslatorInstance> {
  const api = factory();
  if (!api) throw new Error("UNSUPPORTED");

  return api.create({
    sourceLanguage: "bn",
    targetLanguage: "en",
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => {
        const e = event as ProgressEvent;
        if (e.total > 0) onProgress?.(e.loaded / e.total);
      });
    },
  });
}

/** Translates one Bangla string and applies the newsroom glossary. */
async function translateOne(
  translator: TranslatorInstance,
  bangla: string,
): Promise<string> {
  const trimmed = bangla.trim();
  if (!trimmed) return bangla;

  // Bengali numerals often survive translation untouched, so normalise first.
  const prepared = bengaliDigitsToLatin(bangla);
  const raw = await translator.translate(prepared);
  return applyGlossary(bangla, raw);
}

export interface TranslateProgress {
  /** 0-1 while the language pack downloads; null once translating. */
  download: number | null;
  /** Text segments finished so far. */
  done: number;
  total: number;
}

export interface ArticleFields {
  title: string;
  excerpt: string;
  bodyHtml: string;
}

/**
 * Translates a whole article in one pass.
 *
 * The body is translated **text node by text node** so every tag — headings,
 * lists, tables, links, images — comes through byte-identical; only the words
 * change. That is also why the glossary is applied per node: each node's own
 * Bangla text decides which corrections are safe for its translation.
 */
export async function translateArticle(
  fields: ArticleFields,
  onProgress?: (progress: TranslateProgress) => void,
): Promise<ArticleFields> {
  let translator: TranslatorInstance | null = null;

  try {
    translator = await createTranslator((download) =>
      onProgress?.({ download, done: 0, total: 0 }),
    );

    const doc = new DOMParser().parseFromString(
      fields.bodyHtml || "<p></p>",
      "text/html",
    );
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node.nodeValue && node.nodeValue.trim()) textNodes.push(node);
    }

    const total = textNodes.length + 2; // + title + excerpt
    let done = 0;
    const tick = () => onProgress?.({ download: null, done: ++done, total });

    const title = await translateOne(translator, fields.title);
    tick();
    const excerpt = await translateOne(translator, fields.excerpt);
    tick();

    for (const node of textNodes) {
      node.nodeValue = await translateOne(translator, node.nodeValue ?? "");
      tick();
    }

    return { title, excerpt, bodyHtml: doc.body.innerHTML };
  } finally {
    translator?.destroy?.();
  }
}
