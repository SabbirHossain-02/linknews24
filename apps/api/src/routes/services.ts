import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { authAccount } from "../middleware/account";
import { emitChange } from "../realtime";
import { donorBadge, nextEligibleDate, isEligibleNow } from "../lib/donorBadge";
import { BLOOD_GROUPS } from "../lib/blood";

/**
 * Reader-submitted directory listings: lawyers, blood donors and hospitals.
 *
 * A reader fills the form from their dashboard, it lands as PENDING, and an
 * admin approves it before anything shows on the site. Re-submitting an
 * approved listing sends it back to PENDING, since the point of the review is
 * that published details were checked.
 */
export const servicesRouter = Router();

/** Listings carry the account's own avatar rather than a separate upload. */
async function accountPhoto(accountId: string): Promise<string | null> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { avatar: true },
  });
  return account?.avatar ?? null;
}

async function districtIdFor(slugOrId: string): Promise<string | null> {
  const byId = await prisma.district.findUnique({ where: { id: slugOrId } });
  if (byId) return byId.id;
  const bySlug = await prisma.district.findUnique({ where: { slug: slugOrId } });
  return bySlug?.id ?? null;
}

/* ------------------------------------------------------------ my listings */

servicesRouter.get("/mine", authAccount, async (req, res) => {
  const accountId = req.accountId!;
  const [lawyer, donor, hospital] = await Promise.all([
    prisma.lawyer.findFirst({
      where: { accountId },
      include: { district: { select: { slug: true, name: true } } },
    }),
    prisma.bloodDonor.findFirst({
      where: { accountId },
      include: {
        district: { select: { slug: true, name: true } },
        donations: { orderBy: { donatedOn: "desc" } },
      },
    }),
    prisma.hospital.findFirst({
      where: { accountId },
      include: { district: { select: { slug: true, name: true } } },
    }),
  ]);

  res.json({
    lawyer,
    donor: donor
      ? {
          ...donor,
          badge: donorBadge(donor.donations.length),
          nextEligible: nextEligibleDate(donor.lastDonation),
          eligibleNow: isEligibleNow(donor.lastDonation),
        }
      : null,
    hospital,
  });
});

/* ---------------------------------------------------------------- lawyer */

const lawyerSchema = z.object({
  name: z.string().min(2).max(120),
  spec: z.string().min(1).max(120),
  phone: z.string().min(6).max(30),
  district: z.string().min(1),
  chamber: z.string().max(300).optional(),
  barEnrollNo: z.string().min(1).max(60),
  enrolledOn: z.string().optional(),
  sanadUrl: z.string().max(500).optional(),
  barAssociation: z.string().max(160).optional(),
  barMemberId: z.string().max(60).optional(),
});

servicesRouter.post("/lawyer", authAccount, async (req, res) => {
  const parsed = lawyerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সব ঘর ঠিকভাবে পূরণ করুন" });
  const d = parsed.data;

  const districtId = await districtIdFor(d.district);
  if (!districtId) return res.status(400).json({ error: "জেলা পাওয়া যায়নি" });

  const data = {
    name: d.name,
    spec: d.spec,
    specEn: d.spec,
    phone: d.phone,
    chamber: d.chamber ?? null,
    districtId,
    barEnrollNo: d.barEnrollNo,
    enrolledOn: d.enrolledOn ? new Date(d.enrolledOn) : null,
    sanadUrl: d.sanadUrl ?? null,
    barAssociation: d.barAssociation ?? null,
    barMemberId: d.barMemberId ?? null,
    photo: await accountPhoto(req.accountId!),
    // Any edit goes back through review — that is what approval means.
    status: "PENDING" as const,
    reviewNote: null,
  };

  const existing = await prisma.lawyer.findFirst({
    where: { accountId: req.accountId! },
  });
  const lawyer = existing
    ? await prisma.lawyer.update({ where: { id: existing.id }, data })
    : await prisma.lawyer.create({
        data: { ...data, accountId: req.accountId! },
      });

  emitChange({ type: "listing", service: "lawyer" });
  res.json({ lawyer });
});

/* ----------------------------------------------------------------- donor */

const donorSchema = z.object({
  name: z.string().min(2).max(120),
  donorNo: z.string().max(60).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  group: z.string().min(1),
  phone: z.string().min(6).max(30),
  address: z.string().max(300).optional(),
  district: z.string().min(1),
  lastDonation: z.string().optional(),
});

servicesRouter.post("/donor", authAccount, async (req, res) => {
  const parsed = donorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সব ঘর ঠিকভাবে পূরণ করুন" });
  const d = parsed.data;

  const group = BLOOD_GROUPS.find((g) => g.label === d.group || g.slug === d.group);
  if (!group) return res.status(400).json({ error: "রক্তের গ্রুপ ঠিক নয়" });

  const districtId = await districtIdFor(d.district);
  if (!districtId) return res.status(400).json({ error: "জেলা পাওয়া যায়নি" });

  const data = {
    name: d.name,
    donorNo: d.donorNo ?? null,
    dob: d.dob ? new Date(d.dob) : null,
    gender: d.gender ?? null,
    group: group.label,
    phone: d.phone,
    address: d.address ?? null,
    districtId,
    lastDonation: d.lastDonation ? new Date(d.lastDonation) : null,
    photo: await accountPhoto(req.accountId!),
    status: "PENDING" as const,
    reviewNote: null,
  };

  const existing = await prisma.bloodDonor.findFirst({
    where: { accountId: req.accountId! },
  });
  const donor = existing
    ? await prisma.bloodDonor.update({ where: { id: existing.id }, data })
    : await prisma.bloodDonor.create({
        data: { ...data, accountId: req.accountId! },
      });

  emitChange({ type: "listing", service: "donor" });
  res.json({ donor });
});

/* --------------------------------------------------- donation log (score) */

const donationSchema = z.object({
  donatedOn: z.string().min(1),
  place: z.string().max(200).optional(),
});

servicesRouter.post("/donor/donations", authAccount, async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "তারিখ দিন" });

  const donor = await prisma.bloodDonor.findFirst({
    where: { accountId: req.accountId! },
  });
  if (!donor)
    return res.status(400).json({ error: "আগে রক্তদাতার তথ্য জমা দিন" });

  const donatedOn = new Date(parsed.data.donatedOn);
  if (isNaN(donatedOn.getTime()) || donatedOn.getTime() > Date.now())
    return res.status(400).json({ error: "তারিখ ভবিষ্যতে হতে পারে না" });

  await prisma.bloodDonation.create({
    data: { donorId: donor.id, donatedOn, place: parsed.data.place ?? null },
  });

  // The most recent entry is also the donor's "last donation".
  const latest = await prisma.bloodDonation.findFirst({
    where: { donorId: donor.id },
    orderBy: { donatedOn: "desc" },
  });
  await prisma.bloodDonor.update({
    where: { id: donor.id },
    data: { lastDonation: latest?.donatedOn ?? null },
  });

  const count = await prisma.bloodDonation.count({ where: { donorId: donor.id } });
  emitChange({ type: "listing", service: "donor" });
  res.json({ ok: true, badge: donorBadge(count) });
});

servicesRouter.delete("/donor/donations/:id", authAccount, async (req, res) => {
  const donor = await prisma.bloodDonor.findFirst({
    where: { accountId: req.accountId! },
  });
  if (!donor) return res.status(404).json({ error: "Not found" });

  await prisma.bloodDonation
    .deleteMany({ where: { id: req.params.id, donorId: donor.id } })
    .catch(() => null);

  const latest = await prisma.bloodDonation.findFirst({
    where: { donorId: donor.id },
    orderBy: { donatedOn: "desc" },
  });
  await prisma.bloodDonor.update({
    where: { id: donor.id },
    data: { lastDonation: latest?.donatedOn ?? null },
  });

  emitChange({ type: "listing", service: "donor" });
  res.json({ ok: true });
});

/* -------------------------------------------------------------- hospital */

const hospitalSchema = z.object({
  name: z.string().min(2).max(160),
  type: z.enum(["GOVERNMENT", "PRIVATE", "SPECIALIZED", "NGO"]),
  address: z.string().min(3).max(300),
  district: z.string().min(1),
  thana: z.string().max(120).optional(),
  hotline: z.string().min(4).max(60),
  emergency24: z.boolean().default(false),
});

servicesRouter.post("/hospital", authAccount, async (req, res) => {
  const parsed = hospitalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সব ঘর ঠিকভাবে পূরণ করুন" });
  const d = parsed.data;

  const districtId = await districtIdFor(d.district);
  if (!districtId) return res.status(400).json({ error: "জেলা পাওয়া যায়নি" });

  const data = {
    name: d.name,
    type: d.type,
    address: d.address,
    districtId,
    thana: d.thana ?? null,
    hotline: d.hotline,
    emergency24: d.emergency24,
    photo: await accountPhoto(req.accountId!),
    status: "PENDING" as const,
    reviewNote: null,
  };

  const existing = await prisma.hospital.findFirst({
    where: { accountId: req.accountId! },
  });
  const hospital = existing
    ? await prisma.hospital.update({ where: { id: existing.id }, data })
    : await prisma.hospital.create({
        data: { ...data, accountId: req.accountId! },
      });

  emitChange({ type: "listing", service: "hospital" });
  res.json({ hospital });
});

/* ---------------------------------------------------------------- delete */

/**
 * Withdraw one's own listing.
 *
 * Scoped to the signed-in account, so a reader can only remove what they
 * submitted — an admin deleting someone's listing goes through the admin
 * routes instead.
 */
servicesRouter.delete("/:service", authAccount, async (req, res) => {
  const accountId = req.accountId!;
  const { service } = req.params;

  if (service === "lawyer")
    await prisma.lawyer.deleteMany({ where: { accountId } });
  else if (service === "donor")
    await prisma.bloodDonor.deleteMany({ where: { accountId } });
  else if (service === "hospital")
    await prisma.hospital.deleteMany({ where: { accountId } });
  else return res.status(400).json({ error: "অজানা সেবা" });

  emitChange({ type: "listing", service });
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ like */

servicesRouter.post("/donors/:id/like", authAccount, async (req, res) => {
  const donorId = req.params.id;
  const accountId = req.accountId!;

  const existing = await prisma.donorLike.findUnique({
    where: { donorId_accountId: { donorId, accountId } },
  });

  if (existing) {
    await prisma.donorLike.delete({ where: { id: existing.id } });
  } else {
    const donor = await prisma.bloodDonor.findFirst({
      where: { id: donorId, status: "APPROVED" },
    });
    if (!donor) return res.status(404).json({ error: "Not found" });
    await prisma.donorLike.create({ data: { donorId, accountId } });
  }

  const likes = await prisma.donorLike.count({ where: { donorId } });
  res.json({ liked: !existing, likes });
});
