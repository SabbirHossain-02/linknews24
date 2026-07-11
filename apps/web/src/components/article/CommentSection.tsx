"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { relativeTime } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

interface PublicComment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

export function CommentSection({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [form, setForm] = useState({ name: "", email: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(() => {
    fetch(`${API_BASE}/api/articles/${slug}/comments`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    return () => {
      socket.off("content:changed", load);
    };
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", email: "", body: "" });
        setDone(true);
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

  return (
    <section className="border-t border-border pt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
        <MessageSquare className="h-5 w-5 text-brand-crimson" />
        {t("comments")}
        {comments.length > 0 && (
          <span className="font-ui text-sm font-normal text-foreground-muted">
            ({comments.length})
          </span>
        )}
      </h2>

      {done ? (
        <p className="mt-4 rounded-lg border border-brand-crimson/20 bg-brand-crimson/5 px-4 py-3 text-sm text-foreground">
          {t("commentPending")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t("commentName")}
              className={inputCls}
              maxLength={80}
            />
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder={t("commentEmail")}
              type="email"
              className={inputCls}
            />
          </div>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder={t("commentBody")}
            rows={3}
            maxLength={2000}
            className={`${inputCls} resize-y`}
          />
          <button
            type="submit"
            disabled={submitting || !form.name.trim() || !form.body.trim()}
            className="flex items-center gap-1.5 self-end rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {t("commentSubmit")}
          </button>
        </form>
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {comments.length === 0 ? (
          <li className="font-ui text-sm text-foreground-muted">{t("noComments")}</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="font-ui text-xs text-foreground-muted">
                  {relativeTime(c.createdAt, locale)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{c.body}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
