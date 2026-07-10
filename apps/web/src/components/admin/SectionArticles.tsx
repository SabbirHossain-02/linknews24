"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Star } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminT } from "@/lib/admin-i18n";

interface SecArticle {
  id: string;
  title: string;
  sectionLead: boolean;
}

export function SectionArticles({ categoryId }: { categoryId: string }) {
  const t = useAdminT();
  const [items, setItems] = useState<SecArticle[]>([]);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    apiFetch<{ articles: SecArticle[] }>(`/api/admin/section-articles/${categoryId}`)
      .then((d) => {
        setItems(d.articles);
        setLeadId(d.articles.find((a) => a.sectionLead)?.id ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  const save = (list: SecArticle[], lead: string | null) => {
    apiFetch(`/api/admin/section-articles/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify({ orderedIds: list.map((a) => a.id), leadId: lead }),
    }).catch(() => {});
  };

  const onDrop = () => {
    const from = dragItem.current;
    const to = dragOver.current;
    dragItem.current = null;
    dragOver.current = null;
    setDragIdx(null);
    if (from == null || to == null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    save(next, leadId);
  };

  const setLead = (id: string) => {
    const next = leadId === id ? null : id;
    setLeadId(next);
    save(items, next);
  };

  if (loading)
    return <p className="px-3 py-2 font-ui text-xs text-foreground-muted">{t("loading")}</p>;

  return (
    <div className="mt-2 rounded-lg border border-border bg-surface/50 p-2">
      <p className="mb-2 px-1 font-ui text-xs text-foreground-muted">{t("dragHint")}</p>
      <ul className="flex flex-col gap-1">
        {items.map((a, i) => (
          <li
            key={a.id}
            draggable
            onDragStart={() => {
              dragItem.current = i;
              setDragIdx(i);
            }}
            onDragEnter={() => (dragOver.current = i)}
            onDragEnd={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5 ${
              dragIdx === i ? "border-brand-crimson opacity-60" : "border-border"
            } ${leadId === a.id ? "ring-1 ring-brand-crimson" : ""}`}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-foreground-muted" />
            <button
              type="button"
              onClick={() => setLead(a.id)}
              title={t("leadBadge")}
              className={leadId === a.id ? "text-brand-crimson" : "text-foreground-muted hover:text-brand-crimson"}
            >
              <Star className="h-4 w-4" fill={leadId === a.id ? "currentColor" : "none"} />
            </button>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {a.title}
            </span>
            {leadId === a.id && (
              <span className="shrink-0 rounded bg-brand-crimson px-1.5 py-0.5 font-ui text-[10px] font-semibold text-white">
                {t("leadBadge")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
