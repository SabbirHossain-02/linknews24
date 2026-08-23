"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarClock, Droplet, Heart, MapPin, Phone, User } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { bnDate, toggleDonorLike, type DonorListing } from "@/lib/services-api";
import { bloodGroups, districts, formatPhone } from "@/lib/directory-data";

/**
 * The blood-donor feed.
 *
 * Laid out as a stream of profile cards rather than a table, because a donor
 * is a person someone is about to phone in an emergency — the photo, the
 * badge and whether they can actually give today matter more than tidy
 * columns. Recognition is a badge, never a count: a visible number would turn
 * donating into a leaderboard.
 */
export function DonorFeed({
  initialGroup = "",
}: {
  initialGroup?: string;
}) {
  const [donors, setDonors] = useState<DonorListing[]>([]);
  const [group, setGroup] = useState(initialGroup);
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

  return (
    <div className="flex flex-col gap-4">
      {/* filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        >
          <option value="">সব রক্তের গ্রুপ</option>
          {bloodGroups.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        >
          <option value="">সব জেলা</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {needLogin && (
        <p className="rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          পছন্দ জানাতে হলে আগে লগইন করুন।
        </p>
      )}

      {loading ? (
        <p className="font-ui text-sm text-foreground-muted">লোড হচ্ছে…</p>
      ) : donors.length === 0 ? (
        <p className="rounded-xl border border-border bg-background p-8 text-center font-ui text-sm text-foreground-muted">
          এই শর্তে কোনো রক্তদাতা পাওয়া যায়নি।
        </p>
      ) : (
        donors.map((d) => (
          <article
            key={d.id}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <header className="flex items-start gap-3">
              {d.photo ? (
                <Image
                  src={d.photo}
                  alt={d.name}
                  width={52}
                  height={52}
                  className="h-13 w-13 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                  <User className="h-6 w-6" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-heading">{d.name}</h3>
                  {d.badge && (
                    <span
                      className="rounded-full px-2.5 py-0.5 font-ui text-[11px] font-bold text-white"
                      style={{ background: d.badge.color }}
                    >
                      {d.badge.label}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.district?.name ?? "—"}
                  </span>
                  {d.gender && (
                    <span>
                      {d.gender === "male"
                        ? "পুরুষ"
                        : d.gender === "female"
                          ? "নারী"
                          : "অন্যান্য"}
                    </span>
                  )}
                </p>
              </div>

              <span className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-crimson px-3 py-1.5 font-ui text-sm font-bold text-white">
                <Droplet className="h-4 w-4" />
                {d.group}
              </span>
            </header>

            {/* availability — the thing a caller actually needs to know */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {d.eligibleNow ? (
                <span className="rounded-lg bg-green-50 px-3 py-1.5 font-ui text-xs font-semibold text-green-800">
                  এখন রক্ত দিতে পারবেন
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 font-ui text-xs font-semibold text-amber-800">
                  <CalendarClock className="h-3.5 w-3.5" />
                  পরবর্তী রক্তদান: {bnDate(d.nextEligible)}
                </span>
              )}
              {d.lastDonation && (
                <span className="font-ui text-xs text-foreground-muted">
                  শেষ দিয়েছেন {bnDate(d.lastDonation)}
                </span>
              )}
            </div>

            {d.address && (
              <p className="mt-2 font-ui text-sm text-foreground-muted">
                {d.address}
              </p>
            )}

            <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
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
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
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
        ))
      )}
    </div>
  );
}
