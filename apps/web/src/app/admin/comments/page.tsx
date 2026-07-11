"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Trash2, X, Ban } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface Comment {
  id: string;
  name: string;
  email: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: string;
  article: { title: string; slug: string } | null;
}

const TABS = [
  { status: "PENDING", key: "commentsPending" },
  { status: "APPROVED", key: "commentsApproved" },
  { status: "REJECTED", key: "commentsRejected" },
  { status: "SPAM", key: "commentsSpam" },
] as const;

export default function CommentsAdminPage() {
  const t = useAdminT();
  const [tab, setTab] = useState<Comment["status"]>("PENDING");
  const [comments, setComments] = useState<Comment[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    apiFetch<{ comments: Comment[] }>(`/api/admin/comments?status=${tab}`)
      .then((d) => setComments(d.comments))
      .catch(() => {});
  }, [tab]);

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    return () => {
      socket.off("content:changed", load);
    };
  }, [load]);

  const setStatus = async (id: string, status: Comment["status"]) => {
    await apiFetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setComments((cs) => cs.filter((c) => c.id !== id));
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setComments((cs) => cs.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("comments")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((x) => (
          <button
            key={x.status}
            onClick={() => setTab(x.status)}
            className={`rounded-lg px-3.5 py-2 font-ui text-sm font-semibold transition ${
              tab === x.status
                ? "bg-brand-crimson text-white"
                : "border border-border bg-background text-foreground hover:bg-surface"
            }`}
          >
            {t(x.key)}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {comments.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noComments")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    {c.email && (
                      <span className="ml-2 font-ui text-xs text-foreground-muted">
                        {c.email}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {tab !== "APPROVED" && (
                      <button
                        onClick={() => setStatus(c.id, "APPROVED")}
                        title={t("commentApprove")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    {tab !== "REJECTED" && (
                      <button
                        onClick={() => setStatus(c.id, "REJECTED")}
                        title={t("commentReject")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {tab !== "SPAM" && (
                      <button
                        onClick={() => setStatus(c.id, "SPAM")}
                        title={t("commentMarkSpam")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(c.id)}
                      title={t("delete")}
                      className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{c.body}</p>
                {c.article && (
                  <p className="font-ui text-xs text-foreground-muted">
                    {t("commentOn")} {c.article.title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

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
