"use client";

import { API_BASE } from "@/lib/admin-api";

/**
 * Client for the reader-submitted service directory (lawyers, blood donors,
 * hospitals). Everything here goes through the account cookie, so calls must
 * send credentials.
 */

export interface DonorBadge {
  key: string;
  label: string;
  labelEn: string;
  color: string;
}

export interface DistrictRef {
  slug: string;
  name: string;
  nameEn?: string;
}

export interface LawyerListing {
  id: string;
  name: string;
  spec: string;
  phone: string;
  chamber: string | null;
  barEnrollNo: string | null;
  enrolledOn: string | null;
  sanadUrl: string | null;
  barAssociation: string | null;
  barMemberId: string | null;
  photo: string | null;
  status: ListingStatus;
  reviewNote: string | null;
  district?: DistrictRef | null;
}

export interface DonationEntry {
  id: string;
  donatedOn: string;
  place: string | null;
  verified: boolean;
}

export interface DonorListing {
  id: string;
  name: string;
  donorNo: string | null;
  dob: string | null;
  gender: string | null;
  group: string;
  phone: string;
  address: string | null;
  photo: string | null;
  lastDonation: string | null;
  status: ListingStatus;
  reviewNote: string | null;
  district?: DistrictRef | null;
  donations?: DonationEntry[];
  badge?: DonorBadge | null;
  nextEligible?: string | null;
  eligibleNow?: boolean;
  likes?: number;
  likedByMe?: boolean;
}

export interface HospitalListing {
  id: string;
  name: string;
  type: HospitalType;
  address: string;
  thana: string | null;
  hotline: string;
  emergency24: boolean;
  photo: string | null;
  status: ListingStatus;
  reviewNote: string | null;
  district?: DistrictRef | null;
}

export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";
export type HospitalType = "GOVERNMENT" | "PRIVATE" | "SPECIALIZED" | "NGO";

import type { TranslationKey } from "./i18n";

/** Each option names its translation key rather than carrying one language. */
export const HOSPITAL_TYPES: { value: HospitalType; label: TranslationKey }[] = [
  { value: "GOVERNMENT", label: "hospGovernment" },
  { value: "PRIVATE", label: "hospPrivate" },
  { value: "SPECIALIZED", label: "hospSpecialized" },
  { value: "NGO", label: "hospNgo" },
];

export const STATUS_LABEL: Record<ListingStatus, TranslationKey> = {
  PENDING: "listingPending",
  APPROVED: "listingApproved",
  REJECTED: "listingRejected",
};

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error((data && (data as { error?: string }).error) || "Request failed");
  return data as T;
}

export interface MyListings {
  lawyer: LawyerListing | null;
  donor: DonorListing | null;
  hospital: HospitalListing | null;
}

export const getMyListings = () => call<MyListings>("/services/mine");

export const submitLawyer = (body: unknown) =>
  call<{ lawyer: LawyerListing }>("/services/lawyer", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const submitDonor = (body: unknown) =>
  call<{ donor: DonorListing }>("/services/donor", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const submitHospital = (body: unknown) =>
  call<{ hospital: HospitalListing }>("/services/hospital", {
    method: "POST",
    body: JSON.stringify(body),
  });

/** Withdraw one's own listing — scoped server-side to the signed-in account. */
export const deleteMyListing = (service: "lawyer" | "donor" | "hospital") =>
  call<{ ok: true }>(`/services/${service}`, { method: "DELETE" });

export const addDonation = (donatedOn: string, place?: string) =>
  call<{ ok: true; badge: DonorBadge | null }>("/services/donor/donations", {
    method: "POST",
    body: JSON.stringify({ donatedOn, place }),
  });

export const removeDonation = (id: string) =>
  call<{ ok: true }>(`/services/donor/donations/${id}`, { method: "DELETE" });

export const toggleDonorLike = (id: string) =>
  call<{ liked: boolean; likes: number }>(`/services/donors/${id}/like`, {
    method: "POST",
  });

/** Bangla-friendly date, tolerant of nulls. */
export function bnDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
