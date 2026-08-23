"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarClock, Droplet, Heart, MapPin, Phone, User } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { bnDate, toggleDonorLike, type DonorListing } from "@/lib/services-api";
import { bloodGroups, districts, formatPhone } from "@/lib/directory-data";
import { useLocale } from "@/components/providers/LocaleProvider";
import { localizedName } from "@/lib/i18n";

/**
 * The blood-donor feed.
 *
 * A grid of profile cards — three across on a wide screen, two on a tablet,
 * one on a phone — rather than a table, because a donor is a person somebody
 * is about to phone in an emergency. The photo, the badge and whether they can
 * actually give today matter more than tidy columns. Recognition is a badge,
 * never a count: a visible number would turn donating into a leaderboard.
 */
export function DonorFeed() {
  const { locale, t } = useLocale();
  const [donors, setDonors] = useState<DonorListing[]>([]);
  const [group, setGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (group) q.set("group", group);
    if (district) q.set("district", district);

    fetch(`${API_BASE}/api/donors?${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setDonors(d.donors ?? []))
      .catch(() => setDonors([]))
      .finally(() => setLoading(false));
  }, [group, district]);

  useEffect(load, [load]);

  const like = async (id: string) => {
    setNeedLogin(false);
    try {
      const { liked, likes } = await toggleDonorLike(id);
      setDonors((rows) =>
        rows.map((d) => (d.id === id ? { ...d, likedByMe: liked, likes } : d)),
      );
    } catch {
      // The like endpoint needs an account — say so instead of doing nothing.
      setNeedLogin(true);
    }
  };

  const genderLabel = (g: string | null) =>
    g === "male" ? t("svcMale") : g === "female" ? t("svcFemale") : t("svcOther");

  const select =
    "rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className={select}
        >
          <option value="">{t("svcAllGroups")}</option>
          {bloodGroups.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className={select}
        >
          <option value="">{t("svcAllDistricts")}</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {localizedName(d, locale)}
            </option>
          ))}
        </select>
      </div>

      {needLogin && (
        <p className="rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {t("svcLoginToLike")}
        </p>
      )}

      {loading ? (
        <p className="font-ui text-sm text-foreground-muted">{t("svcLoading")}</p>
      ) : donors.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-10 text-center">
          <Droplet className="mx-auto h-8 w-8 text-foreground-muted/40" />
          <p className="mt-3 font-ui text-sm text-foreground-muted">
            {t("svcNoResults")}
          </p>
          <p className="mt-1 font-ui text-xs text-foreground-muted">
            {t("svcNoDonorsHint")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {donors.map((d) => (
            <article
              key={d.id}
              className="flex flex-col rounded-xl border border-border bg-background p-4 shadow-sm"
            >
              <header className="flex items-start gap-3">
                {d.photo ? (
                  <Image
                    src={d.photo}
                    alt={d.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                    <User className="h-5 w-5" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-heading">{d.name}</h3>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-ui text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {d.district
                        ? localizedName(
                            { name: d.district.name, nameEn: d.district.nameEn ?? d.district.name },
                            locale,
                          )
                        : "—"}
                    </span>
                    {d.gender && <span>{genderLabel(d.gender)}</span>}
                  </p>
                </div>

                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-crimson px-2.5 py-1 font-ui text-sm font-bold text-white">
                  <Droplet className="h-3.5 w-3.5" />
                  {d.group}
                </span>
              </header>

              {d.badge && (
                <span
                  className="mt-3 self-start rounded-full px-2.5 py-0.5 font-ui text-[11px] font-bold text-white"
                  style={{ background: d.badge.color }}
                >
                  {locale === "en" ? d.badge.labelEn : d.badge.label}
                </span>
              )}

              {/* Availability — the thing a caller actually needs to know. */}
              <div className="mt-3 flex flex-col gap-1.5">
                {d.eligibleNow ? (
                  <span className="self-start rounded-lg bg-green-50 px-2.5 py-1 font-ui text-xs font-semibold text-green-800">
                    {t("svcEligibleNow")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 self-start rounded-lg bg-amber-50 px-2.5 py-1 font-ui text-xs font-semibold text-amber-800">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {t("svcNextDonation")}: {bnDate(d.nextEligible)}
                  </span>
                )}
                {d.lastDonation && (
                  <span className="font-ui text-[11px] text-foreground-muted">
                    {t("svcLastDonated")} {bnDate(d.lastDonation)}
                  </span>
                )}
              </div>

              {d.address && (
                <p className="mt-2 line-clamp-2 font-ui text-sm text-foreground-muted">
                  {d.address}
                </p>
              )}

              <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                <a
                  href={`tel:${d.phone}`}
                  className="flex items-center gap-1.5 font-ui text-sm font-semibold text-brand-crimson hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {formatPhone(d.phone)}
                </a>

                <button
                  type="button"
                  onClick={() => like(d.id)}
                  aria-pressed={d.likedByMe}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-ui text-xs font-medium transition-colors ${
                    d.likedByMe
                      ? "border-brand-crimson bg-brand-crimson/10 text-brand-crimson"
                      : "border-border text-foreground-muted hover:text-brand-crimson"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${d.likedByMe ? "fill-current" : ""}`}
                  />
                  {d.likes ?? 0}
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
