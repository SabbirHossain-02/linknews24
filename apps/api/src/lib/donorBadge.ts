/**
 * Blood-donor recognition.
 *
 * Deliberately a badge, never a score. A visible number turns donating into a
 * leaderboard and invites people to inflate it; a named tier says the same
 * thing — this person gives regularly — without ranking donors against each
 * other or exposing anyone's exact count.
 */

export interface DonorBadge {
  key: string;
  label: string;
  labelEn: string;
  /** Tailwind-free hex, so the web can style it however it likes. */
  color: string;
}

const TIERS: { min: number; badge: DonorBadge }[] = [
  {
    min: 25,
    badge: { key: "lifesaver", label: "জীবনরক্ষী", labelEn: "Life Saver", color: "#7c3aed" },
  },
  {
    min: 11,
    badge: { key: "gold", label: "স্বর্ণ দাতা", labelEn: "Gold Donor", color: "#b8860b" },
  },
  {
    min: 6,
    badge: { key: "silver", label: "রৌপ্য দাতা", labelEn: "Silver Donor", color: "#6b7280" },
  },
  {
    min: 3,
    badge: { key: "regular", label: "নিয়মিত দাতা", labelEn: "Regular Donor", color: "#1c7a4c" },
  },
  {
    min: 1,
    badge: { key: "new", label: "নতুন দাতা", labelEn: "New Donor", color: "#d81f26" },
  },
];

/** The badge earned for a number of recorded donations, or null for none yet. */
export function donorBadge(donationCount: number): DonorBadge | null {
  return TIERS.find((tier) => donationCount >= tier.min)?.badge ?? null;
}

/**
 * A donor may give again 120 days after the last donation — the interval
 * Bangladeshi blood banks work to.
 */
export const DONATION_GAP_DAYS = 120;

export function nextEligibleDate(lastDonation: Date | null): Date | null {
  if (!lastDonation) return null;
  const next = new Date(lastDonation);
  next.setDate(next.getDate() + DONATION_GAP_DAYS);
  return next;
}

export function isEligibleNow(lastDonation: Date | null): boolean {
  const next = nextEligibleDate(lastDonation);
  return !next || next.getTime() <= Date.now();
}
