// One-off: seed the 64 districts + mock lawyers/blood-donors into the DB.
// Run from apps/web:  DATABASE_URL="..." npx tsx scripts/seed-directory.ts
import { PrismaClient } from "@prisma/client";
import {
  districts,
  bloodGroups,
  getLawyersByDistrict,
  getDonorsByGroup,
} from "@/lib/directory-data";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  for (const d of districts) {
    await prisma.district.upsert({
      where: { slug: d.slug },
      update: { name: d.name, nameEn: d.nameEn, division: d.division },
      create: { name: d.name, nameEn: d.nameEn, slug: d.slug, division: d.division },
    });
  }
  const dbDistricts = await prisma.district.findMany();
  const idBySlug = new Map(dbDistricts.map((d) => [d.slug, d.id]));
  const idByName = new Map(dbDistricts.map((d) => [d.name, d.id]));
  console.log(`districts: ${dbDistricts.length}`);

  if ((await prisma.lawyer.count()) === 0) {
    const rows = [];
    for (const d of districts) {
      for (const l of getLawyersByDistrict(d.slug)) {
        rows.push({
          name: l.nameBn,
          spec: l.specBn,
          specEn: l.specEn,
          phone: l.phone,
          districtId: idBySlug.get(d.slug)!,
        });
      }
    }
    await prisma.lawyer.createMany({ data: rows });
    console.log(`lawyers: ${rows.length}`);
  }

  if ((await prisma.bloodDonor.count()) === 0) {
    const rows = [];
    for (const g of bloodGroups) {
      for (const dn of getDonorsByGroup(g.slug)) {
        const districtId = idByName.get(dn.districtBn);
        if (!districtId) continue;
        rows.push({
          name: dn.nameBn,
          group: g.label,
          phone: dn.phone,
          districtId,
          lastDonation: new Date(Date.now() - dn.months * 30 * 24 * 60 * 60 * 1000),
        });
      }
    }
    await prisma.bloodDonor.createMany({ data: rows });
    console.log(`donors: ${rows.length}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
