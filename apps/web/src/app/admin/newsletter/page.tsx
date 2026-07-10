"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function NewsletterAdminPage() {
  const t = useAdminT();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ subscribers: Subscriber[] }>("/api/admin/subscribers")
      .then((d) => setSubs(d.subscribers))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
    load();
  };

  const exportCsv = () => {
    const rows = ["email,subscribed_at", ...subs.map((s) => `${s.email},${s.createdAt}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("newsletter")}</h1>
        {subs.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 font-ui text-sm font-medium text-foreground hover:bg-surface"
          >
            <Download className="h-4 w-4" />
            {t("exportCsv")}
          </button>
        )}
      </div>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {subs.length} {t("subscriberCount")}
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {loading ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">{t("loading")}</p>
        ) : subs.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noSubscribers")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-foreground">{s.email}</span>
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="text-foreground-muted hover:text-brand-crimson"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
