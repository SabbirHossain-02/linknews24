import { prisma } from "../src/prisma";
import { hashPassword } from "../src/lib/password";

const CATEGORIES: { name: string; nameEn: string; slug: string }[] = [
  { name: "জাতীয়", nameEn: "National", slug: "national" },
  { name: "রাজনীতি", nameEn: "Politics", slug: "politics" },
  { name: "বিশেষ প্রতিবেদন", nameEn: "Special Report", slug: "special-report" },
  { name: "সচিবালয়", nameEn: "Secretariat", slug: "secretariat" },
  { name: "দেশজুড়ে", nameEn: "Nationwide", slug: "nationwide" },
  { name: "অর্থনীতি", nameEn: "Business", slug: "business" },
  { name: "আন্তর্জাতিক", nameEn: "World", slug: "world" },
  { name: "খেলাধুলা", nameEn: "Sports", slug: "sports" },
  { name: "চাকরি", nameEn: "Jobs", slug: "jobs" },
  { name: "টপ টেন", nameEn: "Top Ten", slug: "top-ten" },
  { name: "বিনোদন", nameEn: "Entertainment", slug: "entertainment" },
  { name: "ফিচার", nameEn: "Features", slug: "features" },
  { name: "শিক্ষা", nameEn: "Education", slug: "education" },
  { name: "স্বাস্থ্য", nameEn: "Health", slug: "health" },
  { name: "প্রবাস", nameEn: "Diaspora", slug: "diaspora" },
  { name: "লাইফস্টাইল", nameEn: "Lifestyle", slug: "lifestyle" },
  { name: "প্রযুক্তি", nameEn: "Technology", slug: "technology" },
  { name: "মতামত", nameEn: "Opinion", slug: "opinion" },
  { name: "ধর্ম", nameEn: "Religion", slug: "religion" },
  { name: "আইন-আদালত", nameEn: "Law & Crime", slug: "crime" },
  { name: "পরিবেশ", nameEn: "Environment", slug: "environment" },
  { name: "ভিডিও", nameEn: "Video", slug: "video" },
  { name: "ফটো গ্যালারি", nameEn: "Photo Gallery", slug: "gallery" },
];

async function main() {
  // Categories
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, nameEn: c.nameEn, order: i },
      create: { name: c.name, nameEn: c.nameEn, slug: c.slug, order: i },
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories`);

  // Live TV singleton
  await prisma.liveTvSetting.upsert({
    where: { id: "live-tv" },
    update: {},
    create: { id: "live-tv" },
  });

  // Super admin
  const email = process.env.ADMIN_EMAIL ?? "admin@linknews24.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const user = await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME ?? "Super Admin",
        email,
        password: await hashPassword(process.env.ADMIN_PASSWORD ?? "admin1234"),
        role: "SUPER_ADMIN",
      },
    });
    console.log("Created super admin:", user.email);
  } else {
    console.log("Super admin already exists:", email);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
