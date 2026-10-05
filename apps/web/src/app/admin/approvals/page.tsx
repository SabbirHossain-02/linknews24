"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  GitCompare,
  History,
  Pencil,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { toneGradientClass } from "@/lib/tone";
import { Modal } from "@/components/admin/Modal";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";
import { useLocale } from "@/components/providers/LocaleProvider";

interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
}

interface PendingArticle {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  featuredImage: string | null;
  imageTone: string;
  isBreaking: boolean;
  featured: boolean;
  isHero: boolean;
  submittedAt: string | null;
  createdAt: string;
  author: Author;
  category: { name: string; nameEn: string };
}

interface PendingRevision {
  id: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  data: { title?: string; excerpt?: string; featuredImage?: string | null };
  article: {
    id: string;
    title: string;
    slug: string;
    featuredImage: string | null;
    category: { name: string; nameEn: string };
  };
}

interface Decision {
  id: string;
  type: "article" | "revision";
  articleId: string;
  title: string;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  author: string;
}

interface Queue {
  articles: PendingArticle[];
  revisions: PendingRevision[];
  history: Decision[];
}

type Tab = "articles" | "revisions" | "history";

function ago(iso: string | null | undefined, ax: (s: string) => string) {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return ax("এইমাত্র");
  if (min < 60) return `${min} ${ax("মিনিট আগে")}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${ax("ঘণ্টা আগে")}`;
  return `${Math.floor(hr / 24)} ${ax("দিন আগে")}`;
}

function Avatar({ a }: { a: Author }) {
  return a.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={a.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
  ) : (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy font-ui text-[10px] font-bold text-white">
      {a.name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * The Super Admin's approval desk.
 *
 * Everything a staff member sends for publication lands here — new stories,
 * and edits to stories already live. Approving puts it on the site at once;
 * rejecting keeps it off and tells the writer why; a new story can also be
 * sent back to drafts. The queue refreshes itself the moment anything is
 * submitted, from anywhere.
 */
export default function ApprovalsPage() {
  const t = useAdminT();
  const ax = useAdminText();
  const { locale } = useLocale();
  const { isSuper } = useAdminAuth();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [tab, setTab] = useState<Tab>("articles");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PendingArticle | null>(null);
  const [compare, setCompare] = useState<PendingRevision | null>(null);
  const [ask, setAsk] = useState<{
    kind: "reject" | "draft";
    type: "article" | "revision";
    id: string;
    title: string;
  } | null>(null);

  const load = useCallback(
    () =>
      apiFetch<Queue>("/api/admin/approvals")
        .then(setQueue)
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    if (!isSuper) return;
    load();
    const socket = getSocket();
    socket.on("approvals:changed", load);
    return () => {
      socket.off("approvals:changed", load);
    };
  }, [isSuper, load]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const act = async (
    type: "article" | "revision",
    id: string,
    action: "approve" | "reject" | "draft",
    reason?: string,
  ) => {
    setBusy(id);
    setError(null);
    try {
      await apiFetch(`/api/admin/approvals/${type === "article" ? "articles" : "revisions"}/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      // Off the list at once; the realtime refresh confirms it.
      setQueue((q) =>
        q && {
          ...q,
          articles: q.articles.filter((a) => a.id !== id),
          revisions: q.revisions.filter((r) => r.id !== id),
        },
      );
      setPreview(null);
      setCompare(null);
      setToast(
        action === "approve"
          ? ax("অনুমোদিত — সাইটে প্রকাশিত হয়েছে")
          : action === "reject"
            ? ax("বাতিল করা হয়েছে — লেখককে জানানো হয়েছে")
            : ax("খসড়ায় রাখা হয়েছে — লেখককে জানানো হয়েছে"),
      );
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  if (!isSuper)
    return <p className="font-ui text-sm text-foreground-muted">{t("rolesDenied")}</p>;

  const nArticles = queue?.articles.length ?? 0;
  const nRevisions = queue?.revisions.length ?? 0;
  const catName = (c: { name: string; nameEn: string }) =>
    locale === "en" ? c.nameEn || c.name : c.name;

  const TABS: { key: Tab; label: string; count?: number; icon: typeof Eye }[] = [
    { key: "articles", label: "নতুন খবর", count: nArticles, icon: ClipboardCheck },
    { key: "revisions", label: "প্রকাশিত খবরের সংশোধন", count: nRevisions, icon: GitCompare },
    { key: "history", label: "সাম্প্রতিক সিদ্ধান্ত", icon: History },
  ];

  return (
    <div className="max-w-5xl pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-heading">
            <ClipboardCheck className="h-6 w-6 text-brand-crimson" />
            {t("approvalsNav")}
          </h1>
          <p className="mt-1 max-w-2xl font-ui text-sm text-foreground-muted">
            {ax("টিমের পাঠানো খবর ও সংশোধন এখানে আসে। অনুমোদন দিলে সাথে সাথে সাইটে যাবে; বাতিল করলে লেখক নোটিফিকেশন পাবেন।")}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-ui text-xs font-semibold text-green-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          {ax("লাইভ আপডেট")}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-border">
        {TABS.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 font-ui text-sm font-semibold transition-colors ${
              tab === key
                ? "border-brand-crimson text-brand-crimson"
                : "border-transparent text-foreground-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {ax(label)}
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-brand-crimson px-1.5 py-0.5 font-ui text-[10px] font-bold leading-none text-white">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      {!queue ? (
        <p className="mt-6 font-ui text-sm text-foreground-muted">{t("loading")}</p>
      ) : tab === "articles" ? (
        nArticles === 0 ? (
          <Empty text={ax("অনুমোদনের অপেক্ষায় কোনো খবর নেই")} />
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {queue.articles.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row"
              >
                <div
                  className={`relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-44 ${toneGradientClass(a.imageTone as never)}`}
                >
                  {a.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.featuredImage} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-surface px-1.5 py-0.5 font-ui text-[11px] font-semibold text-foreground-muted">
                      {catName(a.category)}
                    </span>
                    {a.isBreaking && <Chip>{ax("ব্রেকিং")}</Chip>}
                    {a.isHero && <Chip>{ax("হিরো")}</Chip>}
                    {a.featured && <Chip>{ax("ফিচার্ড")}</Chip>}
                  </div>
                  <h2 className="mt-1.5 text-lg font-bold leading-snug text-heading">{a.title}</h2>
                  {a.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">{a.excerpt}</p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                    <span className="flex items-center gap-1.5">
                      <Avatar a={a.author} />
                      <b className="text-foreground">{a.author.name}</b>
                      <span>· {t(`role${a.author.role}` as AdminKey)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {ago(a.submittedAt ?? a.createdAt, ax)}
                    </span>
                  </div>
                  <Actions
                    busy={busy === a.id}
                    onPreview={() => setPreview(a)}
                    editHref={`/admin/articles/${a.id}/edit`}
                    onApprove={() => act("article", a.id, "approve")}
                    onReject={() => setAsk({ kind: "reject", type: "article", id: a.id, title: a.title })}
                    onDraft={() => setAsk({ kind: "draft", type: "article", id: a.id, title: a.title })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )
      ) : tab === "revisions" ? (
        nRevisions === 0 ? (
          <Empty text={ax("অনুমোদনের অপেক্ষায় কোনো সংশোধন নেই")} />
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {queue.revisions.map((r) => {
              const titleChanged = r.data.title && r.data.title !== r.article.title;
              return (
                <li key={r.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-ui text-[11px] font-bold text-amber-700">
                      {ax("লাইভ খবরে পরিবর্তন")}
                    </span>
                    <span className="rounded bg-surface px-1.5 py-0.5 font-ui text-[11px] font-semibold text-foreground-muted">
                      {catName(r.article.category)}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-bold leading-snug text-heading">
                    {r.article.title}
                  </h2>
                  {titleChanged && (
                    <p className="mt-1 font-ui text-sm text-foreground-muted">
                      <span className="font-semibold text-green-700">{ax("নতুন শিরোনাম")}:</span>{" "}
                      {r.data.title}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                    <span className="flex items-center gap-1.5">
                      <Avatar a={r.author} />
                      <b className="text-foreground">{r.author.name}</b>
                      <span>· {t(`role${r.author.role}` as AdminKey)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {ago(r.updatedAt, ax)}
                    </span>
                    <a
                      href={`/${r.article.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-crimson hover:underline"
                    >
                      {ax("লাইভ সংস্করণ দেখুন")} ↗
                    </a>
                  </div>
                  <Actions
                    busy={busy === r.id}
                    previewLabel={ax("পরিবর্তন দেখুন")}
                    onPreview={() => setCompare(r)}
                    onApprove={() => act("revision", r.id, "approve")}
                    onReject={() =>
                      setAsk({ kind: "reject", type: "revision", id: r.id, title: r.article.title })
                    }
                  />
                </li>
              );
            })}
          </ul>
        )
      ) : queue.history.length === 0 ? (
        <Empty text={ax("এখনো কোনো সিদ্ধান্ত নেওয়া হয়নি")} />
      ) : (
        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          {queue.history.map((h) => {
            const ok = h.status === "PUBLISHED" || h.status === "APPROVED";
            const draft = h.status === "DRAFT";
            return (
              <li key={`${h.type}:${h.id}`} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    ok
                      ? "bg-green-100 text-green-700"
                      : draft
                        ? "bg-surface text-foreground-muted"
                        : "bg-brand-crimson/10 text-brand-crimson"
                  }`}
                >
                  {ok ? <CheckCircle2 className="h-4 w-4" /> : draft ? <Archive className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/articles/${h.articleId}/edit`}
                    className="font-semibold text-heading hover:text-brand-crimson"
                  >
                    {h.title}
                  </Link>
                  <p className="font-ui text-xs text-foreground-muted">
                    {h.type === "revision" ? ax("সংশোধন") : ax("নতুন খবর")} · {h.author} ·{" "}
                    {ok ? ax("অনুমোদিত") : draft ? ax("খসড়ায় ফেরত") : ax("বাতিল হয়েছে")} ·{" "}
                    {ago(h.reviewedAt, ax)}
                  </p>
                  {h.reviewNote && (
                    <p className="mt-1 rounded-lg bg-surface px-2.5 py-1.5 font-ui text-xs text-foreground">
                      “{h.reviewNote}”
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {preview && (
        <ArticlePreview
          item={preview}
          busy={busy === preview.id}
          onClose={() => setPreview(null)}
          onApprove={() => act("article", preview.id, "approve")}
          onReject={() =>
            setAsk({ kind: "reject", type: "article", id: preview.id, title: preview.title })
          }
        />
      )}

      {compare && (
        <RevisionCompare
          item={compare}
          busy={busy === compare.id}
          onClose={() => setCompare(null)}
          onApprove={() => act("revision", compare.id, "approve")}
          onReject={() =>
            setAsk({ kind: "reject", type: "revision", id: compare.id, title: compare.article.title })
          }
        />
      )}

      {ask && (
        <ReasonModal
          kind={ask.kind}
          title={ask.title}
          onClose={() => setAsk(null)}
          onSubmit={(reason) => {
            const a = ask;
            setAsk(null);
            act(a.type, a.id, a.kind, reason);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[130] -translate-x-1/2 rounded-xl bg-brand-navy px-4 py-2.5 font-ui text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-brand-crimson/10 px-1.5 py-0.5 font-ui text-[11px] font-bold text-brand-crimson">
      {children}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-background py-14 text-center">
      <CheckCircle2 className="h-10 w-10 text-green-500" />
      <p className="mt-3 font-ui text-sm text-foreground-muted">{text}</p>
    </div>
  );
}

function Actions({
  busy,
  previewLabel,
  editHref,
  onPreview,
  onApprove,
  onReject,
  onDraft,
}: {
  busy: boolean;
  previewLabel?: string;
  editHref?: string;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDraft?: () => void;
}) {
  const ax = useAdminText();
  const btn =
    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-ui text-xs font-semibold transition-colors disabled:opacity-50";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" onClick={onPreview} className={`${btn} border-border text-foreground hover:bg-surface`}>
        <Eye className="h-3.5 w-3.5" />
        {previewLabel ?? ax("প্রিভিউ")}
      </button>
      {editHref && (
        <Link href={editHref} className={`${btn} border-border text-foreground hover:bg-surface`}>
          <Pencil className="h-3.5 w-3.5" />
          {ax("এডিট")}
        </Link>
      )}
      <span className="flex-1" />
      {onDraft && (
        <button type="button" disabled={busy} onClick={onDraft} className={`${btn} border-border text-foreground-muted hover:bg-surface`}>
          <Archive className="h-3.5 w-3.5" />
          {ax("খসড়ায় রাখুন")}
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={onReject}
        className={`${btn} border-brand-crimson/30 text-brand-crimson hover:bg-brand-crimson/5`}
      >
        <XCircle className="h-3.5 w-3.5" />
        {ax("বাতিল করুন")}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onApprove}
        className={`${btn} border-green-600 bg-green-600 text-white hover:bg-green-700`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {busy ? ax("হচ্ছে…") : ax("অনুমোদন ও প্রকাশ")}
      </button>
    </div>
  );
}

function ReasonModal({
  kind,
  title,
  onClose,
  onSubmit,
}: {
  kind: "reject" | "draft";
  title: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const ax = useAdminText();
  const [reason, setReason] = useState("");
  return (
    <Modal title={kind === "reject" ? ax("খবরটি বাতিল করবেন?") : ax("খসড়ায় ফেরত পাঠাবেন?")} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(reason.trim());
        }}
      >
        <p className="font-ui text-sm font-semibold text-heading">{title}</p>
        <label className="mt-3 block font-ui text-xs font-semibold text-foreground-muted">
          {ax("কারণ (লেখক নোটিফিকেশনে দেখবেন)")}
        </label>
        <textarea
          autoFocus
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ax("যেমন: সূত্র যাচাই করা দরকার, শিরোনাম বদলান…")}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
          >
            {ax("বাতিল")}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
          >
            {kind === "reject" ? ax("বাতিল করুন") : ax("খসড়ায় রাখুন")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface FullArticle {
  title: string;
  excerpt: string;
  body: string;
  featuredImage: string | null;
}

function ArticlePreview({
  item,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  item: PendingArticle;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const ax = useAdminText();
  const [full, setFull] = useState<FullArticle | null>(null);
  useEffect(() => {
    apiFetch<{ article: FullArticle }>(`/api/admin/articles/${item.id}`)
      .then((d) => setFull(d.article))
      .catch(() => {});
  }, [item.id]);

  return (
    <Modal wide title={ax("প্রিভিউ")} onClose={onClose}>
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        {(full?.featuredImage ?? item.featuredImage) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={full?.featuredImage ?? item.featuredImage ?? ""} alt="" className="mb-4 max-h-72 w-full rounded-xl object-cover" />
        )}
        <h2 className="text-2xl font-bold leading-snug text-heading">{item.title}</h2>
        {item.excerpt && <p className="mt-2 text-foreground-muted">{item.excerpt}</p>}
        {full ? (
          <div
            className="ln-editor mt-4 text-[16px] leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: full.body }}
          />
        ) : (
          <p className="mt-4 font-ui text-sm text-foreground-muted">{ax("লোড হচ্ছে…")}</p>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-lg border border-brand-crimson/30 px-4 py-2 font-ui text-sm font-semibold text-brand-crimson hover:bg-brand-crimson/5 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          {ax("বাতিল করুন")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {ax("অনুমোদন ও প্রকাশ")}
        </button>
      </div>
    </Modal>
  );
}

interface RevisionDetail {
  revision: {
    data: Record<string, unknown> & {
      title?: string;
      excerpt?: string;
      body?: string;
      featuredImage?: string | null;
      isBreaking?: boolean;
      featured?: boolean;
      isHero?: boolean;
      tags?: string[];
    };
    article: {
      title: string;
      excerpt: string;
      body: string;
      featuredImage: string | null;
      isBreaking: boolean;
      featured: boolean;
      isHero: boolean;
      category: { name: string };
      tags: { name: string }[];
    };
  };
  proposedCategory: { name: string } | null;
}

function RevisionCompare({
  item,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  item: PendingRevision;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const ax = useAdminText();
  const [d, setD] = useState<RevisionDetail | null>(null);
  const [side, setSide] = useState<"new" | "old">("new");
  useEffect(() => {
    apiFetch<RevisionDetail>(`/api/admin/approvals/revisions/${item.id}`)
      .then(setD)
      .catch(() => {});
  }, [item.id]);

  const rows = d
    ? [
        { label: ax("শিরোনাম"), old: d.revision.article.title, now: d.revision.data.title ?? "" },
        { label: ax("সারসংক্ষেপ"), old: d.revision.article.excerpt, now: d.revision.data.excerpt ?? "" },
        {
          label: ax("ক্যাটাগরি"),
          old: d.revision.article.category.name,
          now: d.proposedCategory?.name ?? d.revision.article.category.name,
        },
        {
          label: ax("ট্যাগ"),
          old: d.revision.article.tags.map((x) => x.name).join(", "),
          now: (d.revision.data.tags ?? []).join(", "),
        },
        {
          label: ax("ব্রেকিং / হিরো / ফিচার্ড"),
          old: [d.revision.article.isBreaking, d.revision.article.isHero, d.revision.article.featured]
            .map((b) => (b ? "✓" : "—"))
            .join(" / "),
          now: [d.revision.data.isBreaking, d.revision.data.isHero, d.revision.data.featured]
            .map((b) => (b ? "✓" : "—"))
            .join(" / "),
        },
      ]
    : [];
  const bodyChanged = d && (d.revision.data.body ?? "") !== d.revision.article.body;
  const imageChanged =
    d && (d.revision.data.featuredImage ?? null) !== (d.revision.article.featuredImage ?? null);

  return (
    <Modal wide title={ax("পরিবর্তন মিলিয়ে দেখুন")} onClose={onClose}>
      {!d ? (
        <p className="font-ui text-sm text-foreground-muted">{ax("লোড হচ্ছে…")}</p>
      ) : (
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[120px_1fr_1fr] bg-surface font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              <span className="px-3 py-2" />
              <span className="px-3 py-2">{ax("এখন সাইটে")}</span>
              <span className="px-3 py-2 text-green-700">{ax("প্রস্তাবিত")}</span>
            </div>
            {rows.map((r) => {
              const changed = r.old !== r.now;
              return (
                <div key={r.label} className="grid grid-cols-[120px_1fr_1fr] border-t border-border text-sm">
                  <span className="px-3 py-2 font-ui text-xs font-semibold text-foreground-muted">{r.label}</span>
                  <span className={`px-3 py-2 ${changed ? "bg-red-50 text-red-900 line-through decoration-red-300" : "text-foreground"}`}>
                    {r.old || "—"}
                  </span>
                  <span className={`px-3 py-2 ${changed ? "bg-green-50 font-medium text-green-900" : "text-foreground-muted"}`}>
                    {r.now || "—"}
                  </span>
                </div>
              );
            })}
            <div className="grid grid-cols-[120px_1fr_1fr] border-t border-border text-sm">
              <span className="px-3 py-2 font-ui text-xs font-semibold text-foreground-muted">{ax("ছবি")}</span>
              <span className="px-3 py-2">
                {d.revision.article.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.revision.article.featuredImage} alt="" className="h-16 rounded object-cover" />
                ) : "—"}
              </span>
              <span className={`px-3 py-2 ${imageChanged ? "bg-green-50" : ""}`}>
                {d.revision.data.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.revision.data.featuredImage} alt="" className="h-16 rounded object-cover" />
                ) : "—"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="font-ui text-xs font-semibold text-foreground-muted">{ax("মূল লেখা")}:</span>
            {bodyChanged ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-ui text-[11px] font-bold text-amber-700">
                {ax("বদলেছে")}
              </span>
            ) : (
              <span className="font-ui text-xs text-foreground-muted">{ax("অপরিবর্তিত")}</span>
            )}
            <span className="flex-1" />
            {(["new", "old"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`rounded-lg px-2.5 py-1 font-ui text-xs font-semibold ${
                  side === s ? "bg-brand-navy text-white" : "border border-border text-foreground"
                }`}
              >
                {s === "new" ? ax("প্রস্তাবিত") : ax("এখন সাইটে")}
              </button>
            ))}
          </div>
          <div
            className="ln-editor mt-3 rounded-xl border border-border p-4 text-[15px] leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{
              __html: side === "new" ? (d.revision.data.body ?? "") : d.revision.article.body,
            }}
          />
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="flex items-center gap-1.5 rounded-lg border border-brand-crimson/30 px-4 py-2 font-ui text-sm font-semibold text-brand-crimson hover:bg-brand-crimson/5 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          {ax("বাতিল করুন")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {ax("অনুমোদন দিন")}
        </button>
      </div>
    </Modal>
  );
}
